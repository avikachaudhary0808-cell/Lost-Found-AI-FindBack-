package com.findback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LostItemRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @NotBlank(message = "Color is required")
    @Size(max = 30, message = "Color must not exceed 30 characters")
    private String color;

    @NotBlank(message = "Approximate location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String approximateLocation;

    public LostItemRequest() {
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
}
