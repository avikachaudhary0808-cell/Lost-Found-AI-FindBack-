package com.findback.service;

import com.findback.dto.MatchResponse;
import com.findback.entity.FoundItem;
import com.findback.entity.ItemMatch;
import com.findback.entity.LostItem;
import com.findback.entity.User;
import com.findback.repository.FoundItemRepository;
import com.findback.repository.ItemMatchRepository;
import com.findback.repository.LostItemRepository;
import com.findback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final UserRepository userRepository;
    private final ImageMatchingService imageMatchingService;

    @Value("${app.match.threshold:40}")
    private double matchThreshold;

    public MatchService(LostItemRepository lostItemRepository,
                        FoundItemRepository foundItemRepository,
                        ItemMatchRepository itemMatchRepository,
                        UserRepository userRepository,
                        ImageMatchingService imageMatchingService) {
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.itemMatchRepository = itemMatchRepository;
        this.userRepository = userRepository;
        this.imageMatchingService = imageMatchingService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public List<MatchResponse> findMatches(Long lostItemId) {
        User currentUser = getCurrentUser();

        LostItem lostItem = lostItemRepository.findById(lostItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lost item not found"));

        if (!lostItem.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view matches for this item");
        }

        List<FoundItem> candidates = foundItemRepository.findAll();
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        List<ScoredCandidate> scoredCandidates = new ArrayList<>();
        for (FoundItem candidate : candidates) {
            if (candidate.getUser() == null) {
                continue;
            }
            double score = calculateMatchScore(lostItem, candidate);
            double imageScore = extractImageScore(lostItem, candidate);
            if (score >= matchThreshold) {
                scoredCandidates.add(new ScoredCandidate(candidate, score, imageScore));
            }
        }

        scoredCandidates.sort(Comparator.comparingDouble(ScoredCandidate::getScore).reversed());

        List<MatchResponse> results = new ArrayList<>();
        for (ScoredCandidate sc : scoredCandidates) {
            FoundItem foundItem = sc.getFoundItem();
            double score = sc.getScore();
            double imageScore = sc.getImageScore();

            ItemMatch existingMatch = itemMatchRepository
                    .findByLostItemIdAndFoundItemId(lostItemId, foundItem.getId())
                    .orElse(null);

            ItemMatch match;
            if (existingMatch == null) {
                match = new ItemMatch();
                match.setLostItem(lostItem);
                match.setFoundItem(foundItem);
                match.setMatchScore(score);
                match.setStatus(ItemMatch.MatchStatus.PENDING);
                itemMatchRepository.save(match);
            } else {
                match = existingMatch;
                if (!Objects.equals(match.getMatchScore(), score)) {
                    match.setMatchScore(score);
                    itemMatchRepository.save(match);
                }
            }

            results.add(toResponse(foundItem, match, imageScore));
        }

        return results;
    }

    private double calculateMatchScore(LostItem lost, FoundItem found) {
        double categoryScore = calculateCategoryScore(lost, found);
        double colorScore = calculateColorScore(lost, found);
        double descriptionScore = calculateDescriptionScore(lost, found);
        double locationScore = calculateLocationScore(lost, found);
        double timeScore = calculateTimeScore(lost, found);
        double imageScore = calculateImageScore(lost, found);

        return Math.min(100.0, categoryScore + colorScore + descriptionScore + locationScore + timeScore + imageScore);
    }

    private double calculateCategoryScore(LostItem lost, FoundItem found) {
        if (lost.getCategory() != null && lost.getCategory().equalsIgnoreCase(found.getCategory())) {
            return 15.0;
        }
        return 0.0;
    }

    private double calculateColorScore(LostItem lost, FoundItem found) {
        if (lost.getColor() != null && found.getColor() != null
                && lost.getColor().equalsIgnoreCase(found.getColor())) {
            return 10.0;
        }
        return 0.0;
    }

    private double calculateDescriptionScore(LostItem lost, FoundItem found) {
        String desc1 = normalize(lost.getDescription());
        String desc2 = normalize(found.getDescription());
        if (desc1.isEmpty() && desc2.isEmpty()) {
            return 0.0;
        }
        double jaccard = jaccardSimilarity(desc1, desc2);
        return 25.0 * jaccard;
    }

    private double calculateLocationScore(LostItem lost, FoundItem found) {
        String loc1 = normalize(lost.getApproximateLocation());
        String loc2 = normalize(found.getApproximateLocation());
        if (loc1.isEmpty() && loc2.isEmpty()) {
            return 0.0;
        }
        double jaccard = jaccardSimilarity(loc1, loc2);
        return 15.0 * jaccard;
    }

    private double calculateTimeScore(LostItem lost, FoundItem found) {
        LocalDateTime lostTime = lost.getReportedAt();
        LocalDateTime foundTime = found.getReportedAt();
        if (lostTime == null || foundTime == null) {
            return 0.0;
        }
        long hoursDiff = Math.abs(ChronoUnit.HOURS.between(lostTime, foundTime));
        return 10.0 * Math.exp(-hoursDiff / 48.0);
    }

    private double calculateImageScore(LostItem lost, FoundItem found) {
        int similarity = imageMatchingService.compareImages(lost.getImagePath(), found.getImagePath());
        if (similarity < 0) {
            return 0.0;
        }
        return 25.0 * (similarity / 100.0);
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase().replaceAll("[^a-z0-9\\s]", "").trim();
    }

    private double jaccardSimilarity(String text1, String text2) {
        Set<String> words1 = new HashSet<>(Arrays.asList(text1.split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.split("\\s+")));

        if (words1.isEmpty() && words2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    private double extractImageScore(LostItem lost, FoundItem found) {
        int similarity = imageMatchingService.compareImages(lost.getImagePath(), found.getImagePath());
        if (similarity < 0) {
            return -1.0;
        }
        return similarity;
    }

    private MatchResponse toResponse(FoundItem foundItem, ItemMatch match, double imageSimilarityRaw) {
        MatchResponse response = new MatchResponse();
        response.setMatchId(match.getId());
        response.setFoundItemId(foundItem.getId());
        response.setTitle(foundItem.getTitle());
        response.setCategory(foundItem.getCategory());
        response.setColor(foundItem.getColor());
        response.setApproximateLocation(foundItem.getApproximateLocation());
        response.setReportedAt(foundItem.getReportedAt() != null ? foundItem.getReportedAt().toString() : null);
        response.setMatchScore(Math.round(match.getMatchScore() * 100.0) / 100.0);
        response.setMatchStatus(match.getStatus().name());
        if (imageSimilarityRaw < 0) {
            response.setImageSimilarityScore(null);
        } else {
            response.setImageSimilarityScore(Math.round(imageSimilarityRaw * 100.0) / 100.0);
        }
        return response;
    }

    private static class ScoredCandidate {
        private final FoundItem foundItem;
        private final double score;
        private final double imageScore;

        ScoredCandidate(FoundItem foundItem, double score, double imageScore) {
            this.foundItem = foundItem;
            this.score = score;
            this.imageScore = imageScore;
        }

        public FoundItem getFoundItem() {
            return foundItem;
        }

        public double getScore() {
            return score;
        }

        public double getImageScore() {
            return imageScore;
        }
    }
}
