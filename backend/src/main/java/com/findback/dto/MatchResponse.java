package com.findback.dto;

public class MatchResponse {

    private Long matchId;
    private Long foundItemId;
    private String title;
    private String category;
    private String color;
    private String approximateLocation;
    private String reportedAt;
    private Double matchScore;
    private String matchStatus;
    private Double imageSimilarityScore;

    public MatchResponse() {
    }

    public MatchResponse(Long matchId, Long foundItemId, String title, String category, String color,
                         String approximateLocation, String reportedAt, Double matchScore, String matchStatus, Double imageSimilarityScore) {
        this.matchId = matchId;
        this.foundItemId = foundItemId;
        this.title = title;
        this.category = category;
        this.color = color;
        this.approximateLocation = approximateLocation;
        this.reportedAt = reportedAt;
        this.matchScore = matchScore;
        this.matchStatus = matchStatus;
        this.imageSimilarityScore = imageSimilarityScore;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getApproximateLocation() {
        return approximateLocation;
    }

    public void setApproximateLocation(String approximateLocation) {
        this.approximateLocation = approximateLocation;
    }

    public String getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(String reportedAt) {
        this.reportedAt = reportedAt;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public Double getImageSimilarityScore() {
        return imageSimilarityScore;
    }

    public void setImageSimilarityScore(Double imageSimilarityScore) {
        this.imageSimilarityScore = imageSimilarityScore;
    }
}
