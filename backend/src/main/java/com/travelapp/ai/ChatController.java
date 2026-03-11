package com.travelapp.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RagService ragService;

    public ChatController(RagService ragService) {
        this.ragService = ragService;
    }

    public static class ChatRequest {
        @NotBlank
        @Size(max = 500, message = "Question must be under 500 characters")
        private String question;

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }
    }

    @PostMapping
    public ResponseEntity<RagService.ChatResponse> chat(@Valid @RequestBody ChatRequest req) {
        RagService.ChatResponse response = ragService.answer(req.getQuestion().trim());
        return ResponseEntity.ok(response);
    }
}
