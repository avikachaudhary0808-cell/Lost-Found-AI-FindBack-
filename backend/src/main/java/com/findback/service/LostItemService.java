package com.findback.service;

import com.findback.dto.LostItemRequest;
import com.findback.dto.LostItemResponse;
import com.findback.entity.LostItem;
import com.findback.entity.User;
import com.findback.repository.LostItemRepository;
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
public class LostItemService {

    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;

    public LostItemService(LostItemRepository lostItemRepository, UserRepository userRepository, ImageStorageService imageStorageService) {
        this.lostItemRepository = lostItemRepository;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public LostItemResponse create(LostItemRequest request) {
        User owner = getCurrentUser();

        LostItem item = new LostItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setApproximateLocation(request.getApproximateLocation());
        item.setReportedAt(java.time.LocalDateTime.now());
        item.setStatus(LostItem.LostStatus.LOST);
        item.setUser(owner);

        LostItem saved = lostItemRepository.save(item);
        return LostItemResponse.fromEntity(saved, owner.getId());
    }

    public List<LostItemResponse> getAll() {
        return lostItemRepository.findAll().stream()
                .map(item -> LostItemResponse.fromEntity(item, item.getUser().getId()))
                .collect(Collectors.toList());
    }

    public LostItemResponse getById(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));
        return LostItemResponse.fromEntity(item, item.getUser().getId());
    }

    public LostItemResponse update(Long id, LostItemRequest request) {
        User owner = getCurrentUser();

        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setColor(request.getColor());
        item.setApproximateLocation(request.getApproximateLocation());

        LostItem saved = lostItemRepository.save(item);
        return LostItemResponse.fromEntity(saved, owner.getId());
    }

    public void delete(Long id) {
        User owner = getCurrentUser();

        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this item");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
        }

        lostItemRepository.delete(item);
    }

    public LostItemResponse uploadImage(Long id, MultipartFile image) {
        User owner = getCurrentUser();

        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
        }

        String storedPath = imageStorageService.store(image, "lost-items");
        item.setImagePath(storedPath);

        LostItem saved = lostItemRepository.save(item);
        return LostItemResponse.fromEntity(saved, owner.getId());
    }

    public void deleteImage(Long id) {
        User owner = getCurrentUser();

        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));

        if (!item.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }

        if (item.getImagePath() != null) {
            imageStorageService.delete(item.getImagePath());
            item.setImagePath(null);
            lostItemRepository.save(item);
        }
    }
}
