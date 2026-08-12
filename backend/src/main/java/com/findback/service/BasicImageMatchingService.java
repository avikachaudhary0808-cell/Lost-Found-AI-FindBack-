package com.findback.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class BasicImageMatchingService implements ImageMatchingService {

    private final Path uploadDir;

    public BasicImageMatchingService(
            @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public int compareImages(String lostImagePath, String foundImagePath) {
        if (lostImagePath == null || lostImagePath.isBlank()
                || foundImagePath == null || foundImagePath.isBlank()) {
            return -1;
        }

        BufferedImage lostImage = loadImage(resolvePath(lostImagePath));
        BufferedImage foundImage = loadImage(resolvePath(foundImagePath));

        if (lostImage == null || foundImage == null) {
            return -1;
        }

        try {
            return computeSimilarity(lostImage, foundImage);
        } catch (Exception e) {
            return -1;
        }
    }

    private Path resolvePath(String relativePath) {
        return uploadDir.resolve(relativePath).normalize();
    }

    private BufferedImage loadImage(Path path) {
        try {
            File file = path.toFile();
            if (!Files.exists(path) || !Files.isRegularFile(path)) {
                return null;
            }
            return ImageIO.read(file);
        } catch (IOException e) {
            return null;
        }
    }

    private int computeSimilarity(BufferedImage img1, BufferedImage img2) {
        int size = 16;
        BufferedImage resized1 = resize(img1, size);
        BufferedImage resized2 = resize(img2, size);

        long totalDiff = 0;
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                int gray1 = toGrayscale(resized1.getRGB(x, y));
                int gray2 = toGrayscale(resized2.getRGB(x, y));
                totalDiff += Math.abs(gray1 - gray2);
            }
        }

        double maxDiff = (double) size * size * 255;
        double similarity = 1.0 - (totalDiff / maxDiff);
        return (int) Math.round(Math.max(0.0, Math.min(1.0, similarity)) * 100);
    }

    private BufferedImage resize(BufferedImage source, int size) {
        BufferedImage resized = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(source, 0, 0, size, size, null);
        g.dispose();
        return resized;
    }

    private int toGrayscale(int rgb) {
        int r = (rgb >> 16) & 0xFF;
        int g = (rgb >> 8) & 0xFF;
        int b = rgb & 0xFF;
        return (int) (0.299 * r + 0.587 * g + 0.114 * b);
    }
}
