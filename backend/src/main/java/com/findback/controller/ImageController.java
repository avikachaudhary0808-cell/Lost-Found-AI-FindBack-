package com.findback.controller;

import com.findback.storage.ImageStorageService;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageStorageService imageStorageService;
    private final Path uploadDir;

    public ImageController(ImageStorageService imageStorageService,
                           @org.springframework.beans.factory.annotation.Value("${app.upload.dir:uploads}") String uploadDir) {
        this.imageStorageService = imageStorageService;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String folder, @PathVariable String filename) {
        String filePath = folder + "/" + filename;
        Path resolvedPath = uploadDir.resolve(filePath).normalize();

        if (!resolvedPath.startsWith(uploadDir)) {
            return ResponseEntity.notFound().build();
        }

        if (!java.nio.file.Files.exists(resolvedPath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new PathResource(resolvedPath);
        String contentType = detectContentType(resolvedPath);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }

    private String detectContentType(Path path) {
        try {
            String contentType = java.nio.file.Files.probeContentType(path);
            if (contentType != null) {
                return contentType;
            }
        } catch (IOException e) {
            // ignore
        }
        return "application/octet-stream";
    }
}
