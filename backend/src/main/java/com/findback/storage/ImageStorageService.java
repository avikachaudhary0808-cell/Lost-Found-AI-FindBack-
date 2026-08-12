package com.findback.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String store(MultipartFile file, String subfolder);

    void delete(String filePath);

    String getBaseUrl();

    String resolveUrl(String filePath);
}
