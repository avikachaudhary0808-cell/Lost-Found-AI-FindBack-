package com.findback.dto;

public class AnswerSubmissionRequest {

    private String answer;

    public AnswerSubmissionRequest() {
    }

    public AnswerSubmissionRequest(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
