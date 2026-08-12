package com.findback.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalImageStorageService implements ImageStorageService {

    private final Path uploadDir;
    private final String baseUrl;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    ));

    public LocalImageStorageService(
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${app.upload.base-url:/api/images}") String baseUrl) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        Files.createDirectories(this.uploadDir);
    }

    @Override
    public String store(MultipartFile file, String subfolder) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to store empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds maximum limit of 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String extension = getFileExtension(originalFilename);
        if (!isAllowedExtension(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file extension");
        }

        String filename = UUID.randomUUID() + extension;
        Path targetDir = uploadDir.resolve(subfolder).normalize();
        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create upload directory");
        }

        Path targetLocation = targetDir.resolve(filename);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file " + filename);
        }

        return subfolder + "/" + filename;
    }

    @Override
    public void delete(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {
            Path path = uploadDir.resolve(filePath).normalize();
            if (path.startsWith(uploadDir) && Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete file " + filePath);
        }
    }

    @Override
    public String getBaseUrl() {
        return baseUrl;
    }

    @Override
    public String resolveUrl(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return null;
        }
        return baseUrl + "/" + filePath;
    }

    private String getFileExtension(String filename) {
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return filename.substring(lastIndexOf).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        return extension.matches("^\\.(jpg|jpeg|png|gif|webp)$");
    }
}
