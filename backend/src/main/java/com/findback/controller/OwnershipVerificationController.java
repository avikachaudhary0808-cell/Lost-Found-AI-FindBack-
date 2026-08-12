package com.findback.controller;

import com.findback.dto.AnswerSubmissionRequest;
import com.findback.dto.OwnershipVerificationRequest;
import com.findback.dto.OwnershipVerificationResponse;
import com.findback.entity.User;
import com.findback.repository.UserRepository;
import com.findback.service.OwnershipVerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/verifications")
public class OwnershipVerificationController {

    private final OwnershipVerificationService ownershipVerificationService;
    private final UserRepository userRepository;

    public OwnershipVerificationController(OwnershipVerificationService ownershipVerificationService, UserRepository userRepository) {
        this.ownershipVerificationService = ownershipVerificationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/match/{matchId}")
    public ResponseEntity<OwnershipVerificationResponse> createVerification(@PathVariable Long matchId, @RequestBody OwnershipVerificationRequest request) {
        User currentUser = getCurrentUser();
        OwnershipVerificationResponse response = ownershipVerificationService.createVerification(matchId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{verificationId}/answer")
    public ResponseEntity<OwnershipVerificationResponse> submitAnswer(@PathVariable Long verificationId, @RequestBody AnswerSubmissionRequest request) {
        User currentUser = getCurrentUser();
        OwnershipVerificationResponse response = ownershipVerificationService.submitAnswer(verificationId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<OwnershipVerificationResponse> getVerification(@PathVariable Long matchId) {
        User currentUser = getCurrentUser();
        OwnershipVerificationResponse response = ownershipVerificationService.getVerification(matchId, currentUser);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getReason());
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
