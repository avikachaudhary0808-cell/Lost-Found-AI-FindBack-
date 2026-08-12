package com.findback.controller;

import com.findback.dto.FoundItemRequest;
import com.findback.dto.FoundItemResponse;
import com.findback.service.FoundItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/found-items")
public class FoundItemController {

    private final FoundItemService foundItemService;

    public FoundItemController(FoundItemService foundItemService) {
        this.foundItemService = foundItemService;
    }

    @PostMapping
    public ResponseEntity<FoundItemResponse> create(@Valid @RequestBody FoundItemRequest request) {
        FoundItemResponse response = foundItemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FoundItemResponse>> getAll() {
        List<FoundItemResponse> items = foundItemService.getAll();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoundItemResponse> getById(@PathVariable Long id) {
        FoundItemResponse item = foundItemService.getById(id);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoundItemResponse> update(@PathVariable Long id, @Valid @RequestBody FoundItemRequest request) {
        FoundItemResponse item = foundItemService.update(id, request);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foundItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoundItemResponse> uploadImage(@PathVariable Long id,
                                                        @RequestParam("image") MultipartFile image) {
        FoundItemResponse response = foundItemService.uploadImage(id, image);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        foundItemService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
