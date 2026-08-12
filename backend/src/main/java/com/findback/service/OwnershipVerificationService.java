package com.findback.service;

import com.findback.dto.AnswerSubmissionRequest;
import com.findback.dto.OwnershipVerificationRequest;
import com.findback.dto.OwnershipVerificationResponse;
import com.findback.entity.FoundItem;
import com.findback.entity.ItemMatch;
import com.findback.entity.LostItem;
import com.findback.entity.OwnershipVerification;
import com.findback.entity.User;
import com.findback.repository.FoundItemRepository;
import com.findback.repository.ItemMatchRepository;
import com.findback.repository.LostItemRepository;
import com.findback.repository.OwnershipVerificationRepository;
import com.findback.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class OwnershipVerificationService {

    private final ItemMatchRepository itemMatchRepository;
    private final OwnershipVerificationRepository ownershipVerificationRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public OwnershipVerificationService(ItemMatchRepository itemMatchRepository,
                                        OwnershipVerificationRepository ownershipVerificationRepository,
                                        LostItemRepository lostItemRepository,
                                        FoundItemRepository foundItemRepository,
                                        UserRepository userRepository,
                                        BCryptPasswordEncoder passwordEncoder) {
        this.itemMatchRepository = itemMatchRepository;
        this.ownershipVerificationRepository = ownershipVerificationRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public OwnershipVerificationResponse createVerification(Long matchId, OwnershipVerificationRequest request, User currentUser) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        LostItem lostItem = match.getLostItem();
        if (!lostItem.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the lost item owner can initiate verification");
        }

        ownershipVerificationRepository.findByItemMatchId(matchId).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Verification already exists for this match");
        });

        String normalizedAnswer = normalizeAnswer(request.getAnswer());
        String hashedAnswer = passwordEncoder.encode(normalizedAnswer);

        OwnershipVerification verification = new OwnershipVerification();
        verification.setItemMatch(match);
        verification.setChallengeQuestion(request.getChallengeQuestion());
        verification.setChallengeAnswerHash(hashedAnswer);
        verification.setStatus(OwnershipVerification.VerificationStatus.PENDING);
        verification.setNotes(request.getChallengeQuestion());

        OwnershipVerification saved = ownershipVerificationRepository.save(verification);
        return toResponse(saved);
    }

    public OwnershipVerificationResponse submitAnswer(Long verificationId, AnswerSubmissionRequest request, User currentUser) {
        OwnershipVerification verification = ownershipVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification not found"));

        if (!isAuthorized(verification, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to submit an answer for this verification");
        }

        if (verification.getStatus() != OwnershipVerification.VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification is no longer pending");
        }

        String normalizedSubmitted = normalizeAnswer(request.getAnswer());
        boolean matches = passwordEncoder.matches(normalizedSubmitted, verification.getChallengeAnswerHash());

        if (matches) {
            verification.setStatus(OwnershipVerification.VerificationStatus.VERIFIED);
            verification.setVerifiedAt(LocalDateTime.now());
            verification.setNotes("Answer verified successfully");
        } else {
            verification.setStatus(OwnershipVerification.VerificationStatus.REJECTED);
            verification.setNotes("Incorrect answer provided");
        }

        OwnershipVerification saved = ownershipVerificationRepository.save(verification);
        return toResponse(saved);
    }

    public OwnershipVerificationResponse getVerification(Long matchId, User currentUser) {
        ItemMatch match = itemMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        OwnershipVerification verification = ownershipVerificationRepository.findByItemMatchId(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification not found"));

        if (!isAuthorized(verification, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view this verification");
        }

        return toResponse(verification);
    }

    private boolean isAuthorized(OwnershipVerification verification, User currentUser) {
        if (currentUser == null) {
            return false;
        }

        ItemMatch match = verification.getItemMatch();
        LostItem lostItem = match.getLostItem();
        FoundItem foundItem = match.getFoundItem();

        if (lostItem.getUser().getId().equals(currentUser.getId())) {
            return true;
        }

        if (foundItem.getUser() != null && foundItem.getUser().getId().equals(currentUser.getId())) {
            return true;
        }

        if (currentUser.getRole() == User.Role.ADMIN) {
            return true;
        }

        return false;
    }

    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return answer.trim().toLowerCase();
    }

    private OwnershipVerificationResponse toResponse(OwnershipVerification verification) {
        OwnershipVerificationResponse response = new OwnershipVerificationResponse();
        response.setId(verification.getId());
        response.setMatchId(verification.getItemMatch().getId());
        response.setChallengeQuestion(verification.getChallengeQuestion());
        response.setStatus(verification.getStatus().name());
        response.setNotes(verification.getNotes());
        response.setVerifiedAt(verification.getVerifiedAt() != null ? verification.getVerifiedAt().toString() : null);
        response.setCreatedAt(verification.getCreatedAt() != null ? verification.getCreatedAt().toString() : null);
        return response;
    }
}
