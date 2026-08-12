package com.findback.dto;

public class OwnershipVerificationResponse {

    private Long id;
    private Long matchId;
    private String challengeQuestion;
    private String status;
    private String notes;
    private String verifiedAt;
    private String createdAt;

    public OwnershipVerificationResponse() {
    }

    public OwnershipVerificationResponse(Long id, Long matchId, String challengeQuestion, String status, String notes, String verifiedAt, String createdAt) {
        this.id = id;
        this.matchId = matchId;
        this.challengeQuestion = challengeQuestion;
        this.status = status;
        this.notes = notes;
        this.verifiedAt = verifiedAt;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public String getChallengeQuestion() {
        return challengeQuestion;
    }

    public void setChallengeQuestion(String challengeQuestion) {
        this.challengeQuestion = challengeQuestion;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(String verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
