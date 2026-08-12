package com.findback.service;

import com.findback.dto.FoundItemRequest;
import com.findback.dto.FoundItemResponse;
import com.findback.entity.FoundItem;
import com.findback.entity.User;
import com.findback.repository.FoundItemRepository;
import com.findback.repository.UserRepository;
import com.findback.storage.ImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

    public FoundItemService(FoundItemRepository foundItemRepository, UserRepository userRepository, ImageStorageService imageStorageService) {
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public FoundItemResponse create(FoundItemRequest request) {
        User owner = getCurrentUser();

        FoundItem item = new FoundItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setApproximateLocation(request.getApproximateLocation());
        item.setReportedAt(java.time.LocalDateTime.now());
        item.setStatus(FoundItem.FoundStatus.FOUND);
        item.setUser(owner);

        FoundItem saved = foundItemRepository.save(item);
        return FoundItemResponse.fromEntity(saved, owner.getId());
    }

    public List<FoundItemResponse> getAll() {
        return foundItemRepository.findAll().stream()
                .map(item -> FoundItemResponse.fromEntity(item, item.getUser().getId()))
                .collect(Collectors.toList());
    }

    public FoundItemResponse getById(Long id) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Found item not found"));
        return FoundItemResponse.fromEntity(item, item.getUser().getId());
    }

    public FoundItemResponse update(Long id, FoundItemRequest request) {
        User owner = getCurrentUser();

        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Found item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setApproximateLocation(request.getApproximateLocation());

        FoundItem saved = foundItemRepository.save(item);
        return FoundItemResponse.fromEntity(saved, owner.getId());
    }

    public void delete(Long id) {
        User owner = getCurrentUser();

        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Found item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this item");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
        }

        foundItemRepository.delete(item);
    }

    public FoundItemResponse uploadImage(Long id, MultipartFile image) {
        User owner = getCurrentUser();

        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Found item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
        }

        String storedPath = imageStorageService.store(image, "found-items");
        item.setImagePath(storedPath);

        FoundItem saved = foundItemRepository.save(item);
        return FoundItemResponse.fromEntity(saved, owner.getId());
    }

    public void deleteImage(Long id) {
        User owner = getCurrentUser();

        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Found item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
            item.setImagePath(null);
            foundItemRepository.save(item);
        }
    }
}
