package com.findback.controller;

import com.findback.dto.LostItemRequest;
import com.findback.dto.LostItemResponse;
import com.findback.service.LostItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
public class LostItemController {

    private final LostItemService lostItemService;

    public LostItemController(LostItemService lostItemService) {
        this.lostItemService = lostItemService;
    }

    @PostMapping
    public ResponseEntity<LostItemResponse> create(@Valid @RequestBody LostItemRequest request) {
        LostItemResponse response = lostItemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LostItemResponse>> getAll() {
        List<LostItemResponse> items = lostItemService.getAll();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostItemResponse> getById(@PathVariable Long id) {
        LostItemResponse item = lostItemService.getById(id);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LostItemResponse> update(@PathVariable Long id, @Valid @RequestBody LostItemRequest request) {
        LostItemResponse item = lostItemService.update(id, request);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lostItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LostItemResponse> uploadImage(@PathVariable Long id,
                                                        @RequestParam("image") MultipartFile image) {
        LostItemResponse response = lostItemService.uploadImage(id, image);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        lostItemService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
