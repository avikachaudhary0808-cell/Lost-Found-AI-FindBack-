package com.findback.dto;

public class OwnershipVerificationRequest {

    private String challengeQuestion;
    private String answer;

    public OwnershipVerificationRequest() {
    }

    public OwnershipVerificationRequest(String challengeQuestion, String answer) {
        this.challengeQuestion = challengeQuestion;
        this.answer = answer;
    }

    public String getChallengeQuestion() {
        return challengeQuestion;
    }

    public void setChallengeQuestion(String challengeQuestion) {
        this.challengeQuestion = challengeQuestion;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
