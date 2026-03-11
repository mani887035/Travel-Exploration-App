package com.travelapp.ai;

import com.travelapp.destination.Destination;
import com.travelapp.destination.DestinationRepository;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

        private static final Logger log = LoggerFactory.getLogger(RagService.class);

        private final EmbeddingModel embeddingModel;
        private final DestinationRepository destinationRepository;
        private final GeminiClient geminiClient;
        private EmbeddingStore<TextSegment> embeddingStore;

        private static final String SYSTEM_PROMPT = """
                        You are a friendly travel assistant for the Smart Travel Platform — an Indian travel discovery app.
                        Your knowledge is STRICTLY LIMITED to the travel destinations in the context provided below.
                        Rules:
                        1. Only answer questions about Indian travel destinations, seasons, costs, food, and attractions.
                        2. If the question is unrelated, respond ONLY with: "I can only help with questions about travel destinations on our platform."
                        3. Never invent information not in the context.
                        4. Be helpful, concise, and enthusiastic about travel.
                        5. Show costs as ₹ (Indian Rupees).
                        """;

        private static final Set<String> TRAVEL_KEYWORDS = Set.of(
                        "travel", "visit", "place", "destination", "state", "hotel", "stay",
                        "food", "eat", "season", "india", "trip", "tour", "cost", "budget",
                        "beach", "hill", "mountain", "temple", "fort", "wildlife", "trek",
                        "monsoon", "winter", "summer", "rajasthan", "kerala", "goa", "himachal",
                        "attraction", "nearby", "recommend", "best", "where", "how much",
                        "cheap", "expensive", "popular", "famous", "explore");

        public RagService(EmbeddingModel embeddingModel,
                        DestinationRepository destinationRepository,
                        GeminiClient geminiClient) {
                this.embeddingModel = embeddingModel;
                this.destinationRepository = destinationRepository;
                this.geminiClient = geminiClient;
        }

        @PostConstruct
        public void initializeVectorStore() {
                log.info("Initializing RAG in-memory vector store...");
                embeddingStore = new InMemoryEmbeddingStore<>();
                indexDestinations();
                log.info("RAG vector store ready with {} destinations", destinationRepository.count());
        }

        public void indexDestinations() {
                List<Destination> all = destinationRepository.findAll();
                List<TextSegment> segments = new ArrayList<>();
                for (Destination d : all) {
                        dev.langchain4j.data.document.Metadata metadata = new dev.langchain4j.data.document.Metadata();
                        metadata.put("destination_id", String.valueOf(d.getId()));
                        metadata.put("name", d.getName());
                        metadata.put("state", d.getState());
                        TextSegment segment = TextSegment.from(buildDocumentText(d), metadata);
                        segments.add(segment);
                }
                if (!segments.isEmpty()) {
                        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
                        embeddingStore.addAll(embeddings, segments);
                }
        }

        public ChatResponse answer(String question) {
                String lowerQ = question.toLowerCase();
                boolean isTravelRelated = TRAVEL_KEYWORDS.stream().anyMatch(lowerQ::contains);
                if (!isTravelRelated) {
                        return new ChatResponse(
                                        "I can only help with questions about travel destinations on our platform. Try asking about places to visit, best seasons, costs, or local food! 🌏",
                                        Collections.emptyList());
                }

                Embedding questionEmbedding = embeddingModel.embed(question).content();
                List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(questionEmbedding, 5, 0.4);

                if (matches.isEmpty()) {
                        return new ChatResponse(
                                        "I couldn't find specific destinations matching your question. Try asking about a specific Indian state or season!",
                                        Collections.emptyList());
                }

                String context = matches.stream()
                                .map(m -> m.embedded().text())
                                .collect(Collectors.joining("\n\n---\n\n"));

                String fullPrompt = SYSTEM_PROMPT +
                                "\n\n=== DESTINATION CONTEXT ===\n" + context +
                                "\n\n=== USER QUESTION ===\n" + question;

                String answer = geminiClient.generateContent(fullPrompt);

                List<DestinationRef> sources = matches.stream()
                                .map(m -> new DestinationRef(
                                                Long.parseLong(m.embedded().metadata().getString("destination_id")),
                                                m.embedded().metadata().getString("name"),
                                                m.embedded().metadata().getString("state")))
                                .collect(Collectors.toList());

                return new ChatResponse(answer, sources);
        }

        private String buildDocumentText(Destination d) {
                return String.format(
                                "Destination: %s. State: %s. %s Best season(s): %s. " +
                                                "Travel experience: %s. Average cost for 2 days/1 night: ₹%d. " +
                                                "Local food: %s. Nearby attractions: %s.",
                                d.getName(), d.getState(), d.getDescription(),
                                d.getSeason(), d.getTravelExperience(), d.getAvgCost2d1nInr(),
                                d.getLocalFood() != null ? d.getLocalFood() : "Not specified",
                                d.getNearbyAttractions() != null ? d.getNearbyAttractions() : "Not specified");
        }

        public record ChatResponse(String answer, List<DestinationRef> sources) {
        }

        public record DestinationRef(Long id, String name, String state) {
        }
}
