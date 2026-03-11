package com.travelapp.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final WebClient webClient;
    private final String apiKey;
    private final String apiUrl;

    public GeminiClient(WebClient.Builder webClientBuilder,
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.url}") String apiUrl) {
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    @SuppressWarnings("unchecked")
    public String generateContent(String prompt) {
        if (apiKey.startsWith("your-")) {
            log.warn("Gemini API key not configured — returning mock response");
            return getMockResponse(prompt);
        }
        try {
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", 800));
            Map<?, ?> response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null)
                return "Sorry, I couldn't get a response. Please try again.";
            List<?> candidates = (List<?>) response.get("candidates");
            if (candidates == null || candidates.isEmpty())
                return "No response from AI.";
            Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
            List<?> parts = (List<?>) content.get("parts");
            return (String) ((Map<?, ?>) parts.get(0)).get("text");
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return "I'm having trouble connecting to the AI service right now. Please try again in a moment!";
        }
    }

    private String getMockResponse(String prompt) {
        String p = prompt.toLowerCase();
        if (p.contains("winter"))
            return "🌨️ Great winter destinations: Jaipur (₹5,500), Jaisalmer (₹4,500), South Goa (₹7,000). Jaisalmer's camel safaris are magical in cool weather!";
        if (p.contains("summer") || p.contains("hill"))
            return "☀️ For summer: Manali (₹7,000), Spiti Valley (₹9,000), Ooty (₹5,000). The hills are lush and cool!";
        if (p.contains("monsoon"))
            return "🌧️ Monsoon magic at Wayanad (₹4,500), Valley of Flowers (₹6,000), Dudhsagar Falls (₹4,000). Waterfalls are spectacular!";
        if (p.contains("cheap") || p.contains("budget"))
            return "💰 Budget picks: Hampi (₹3,500), Madurai (₹3,500), Rishikesh (₹4,000) — great value!";
        if (p.contains("rajasthan"))
            return "🏰 Rajasthan highlights: Jaipur (₹5,500), Jaisalmer (₹4,500), Udaipur (₹6,000). Best visited in winter (Oct-Mar).";
        if (p.contains("kerala"))
            return "🌿 Kerala gems: Munnar (₹5,000), Alleppey backwaters (₹7,500), Wayanad (₹4,500). Beautiful year-round!";
        return "🌏 India offers incredible destinations for every season! Ask me about specific states, seasons, or experiences.";
    }
}
