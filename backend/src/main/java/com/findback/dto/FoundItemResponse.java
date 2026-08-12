package com.findback.dto;

import com.findback.entity.FoundItem;

public class FoundItemResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String color;
    private String approximateLocation;
    private String reportedAt;
    private String status;
    private Long userId;
    private String createdAt;
    private String updatedAt;
    private String imagePath;

    public FoundItemResponse() {
    }

    public FoundItemResponse(Long id, String title, String description, String category, String color,
                             String approximateLocation, String reportedAt, String status, Long userId,
                             String createdAt, String updatedAt, String imagePath) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.color = color;
        this.approximateLocation = approximateLocation;
        this.reportedAt = reportedAt;
        this.status = status;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.imagePath = imagePath;
    }

    public static FoundItemResponse fromEntity(FoundItem item, Long userId) {
        return new FoundItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getCategory(),
                item.getColor(),
                item.getApproximateLocation(),
                item.getReportedAt() != null ? item.getReportedAt().toString() : null,
                item.getStatus() != null ? item.getStatus().name() : null,
                userId,
                item.getCreatedAt() != null ? item.getCreatedAt().toString() : null,
                item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null,
                item.getImagePath()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}
