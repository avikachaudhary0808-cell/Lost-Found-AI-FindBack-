package com.findback.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_verifications")
public class OwnershipVerification {

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Item match reference is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_match_id", nullable = false, unique = true)
    private ItemMatch itemMatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verifier_id")
    private User verifier; // User or admin who verified it

    @NotNull(message = "Verification status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "challenge_question", columnDefinition = "TEXT")
    private String challengeQuestion;

    @Column(name = "challenge_answer_hash", length = 60)
    private String challengeAnswerHash;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Default constructor
    public OwnershipVerification() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ItemMatch getItemMatch() {
        return itemMatch;
    }

    public void setItemMatch(ItemMatch itemMatch) {
        this.itemMatch = itemMatch;
    }

    public User getVerifier() {
        return verifier;
    }

    public void setVerifier(User verifier) {
        this.verifier = verifier;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getChallengeQuestion() {
        return challengeQuestion;
    }

    public void setChallengeQuestion(String challengeQuestion) {
        this.challengeQuestion = challengeQuestion;
    }

    public String getChallengeAnswerHash() {
        return challengeAnswerHash;
    }

    public void setChallengeAnswerHash(String challengeAnswerHash) {
        this.challengeAnswerHash = challengeAnswerHash;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
