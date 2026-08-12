package com.findback.controller;

import com.findback.dto.MatchResponse;
import com.findback.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/lost/{lostItemId}")
    public ResponseEntity<List<MatchResponse>> findMatches(@PathVariable Long lostItemId) {
        List<MatchResponse> matches = matchService.findMatches(lostItemId);
        return ResponseEntity.ok(matches);
    }
}
