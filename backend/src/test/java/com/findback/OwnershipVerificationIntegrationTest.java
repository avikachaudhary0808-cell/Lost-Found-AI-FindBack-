package com.findback;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findback.dto.AnswerSubmissionRequest;
import com.findback.dto.FoundItemRequest;
import com.findback.dto.LostItemRequest;
import com.findback.dto.OwnershipVerificationRequest;
import com.findback.dto.RegisterRequest;
import com.findback.entity.FoundItem;
import com.findback.entity.ItemMatch;
import com.findback.entity.LostItem;
import com.findback.entity.OwnershipVerification;
import com.findback.repository.FoundItemRepository;
import com.findback.repository.ItemMatchRepository;
import com.findback.repository.LostItemRepository;
import com.findback.repository.OwnershipVerificationRepository;
import com.findback.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.match.threshold=40"
})
public class OwnershipVerificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private ItemMatchRepository itemMatchRepository;

    @Autowired
    private OwnershipVerificationRepository ownershipVerificationRepository;

    private String jwtToken;
    private Long userId;
    private Long lostItemId;
    private Long matchId;

    @BeforeEach
    public void setup() throws Exception {
        ownershipVerificationRepository.deleteAll();
        itemMatchRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();
        userRepository.deleteAll();

        RegisterRequest registerRequest = new RegisterRequest(
                "owner@example.com",
                "Password123!",
                "Owner User",
                "+1234567890"
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andReturn();

        if (result.getResponse().getStatus() == 200) {
            String responseBody = result.getResponse().getContentAsString();
            userId = objectMapper.readTree(responseBody).get("userId").asLong();
            jwtToken = objectMapper.readTree(responseBody).get("token").asText();
        } else {
            com.findback.dto.LoginRequest loginRequest = new com.findback.dto.LoginRequest(
                    "owner@example.com", "Password123!"
            );
            MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn();

            String loginBody = loginResult.getResponse().getContentAsString();
            userId = objectMapper.readTree(loginBody).get("userId").asLong();
            jwtToken = objectMapper.readTree(loginBody).get("token").asText();
        }

        LostItemRequest lostRequest = new LostItemRequest();
        lostRequest.setTitle("Blue Backpack");
        lostRequest.setDescription("Nike blue backpack with laptop compartment");
        lostRequest.setCategory("Bags");
        lostRequest.setColor("Blue");
        lostRequest.setApproximateLocation("Central Library");

        MvcResult lostResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lostRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String lostBody = lostResult.getResponse().getContentAsString();
        lostItemId = objectMapper.readTree(lostBody).get("id").asLong();

        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Blue Backpack Found");
        foundRequest.setDescription("Nike blue backpack found near library");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Blue");
        foundRequest.setApproximateLocation("Central Library");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated());

        MvcResult matchResult = mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String matchBody = matchResult.getResponse().getContentAsString();
        matchId = objectMapper.readTree(matchBody).get(0).get("matchId").asLong();
    }

    @Test
    public void testVerificationCreation() throws Exception {
        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What color is your lost backpack?");
        request.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.challengeQuestion", is("What color is your lost backpack?")));
    }

    @Test
    public void testCorrectAnswerMarksVerified() throws Exception {
        OwnershipVerificationRequest createRequest = new OwnershipVerificationRequest();
        createRequest.setChallengeQuestion("What color is your lost backpack?");
        createRequest.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk());

        AnswerSubmissionRequest answerRequest = new AnswerSubmissionRequest();
        answerRequest.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/" + ownershipVerificationRepository.findByItemMatchId(matchId).get().getId() + "/answer")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VERIFIED")))
                .andExpect(jsonPath("$.verifiedAt", notNullValue()));
    }

    @Test
    public void testIncorrectAnswerMarksRejected() throws Exception {
        OwnershipVerificationRequest createRequest = new OwnershipVerificationRequest();
        createRequest.setChallengeQuestion("What color is your lost backpack?");
        createRequest.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk());

        Long verificationId = ownershipVerificationRepository.findByItemMatchId(matchId).get().getId();

        AnswerSubmissionRequest answerRequest = new AnswerSubmissionRequest();
        answerRequest.setAnswer("Red");

        mockMvc.perform(post("/api/verifications/" + verificationId + "/answer")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));
    }

    @Test
    public void testUnauthorizedUserCannotCreateVerification() throws Exception {
        RegisterRequest otherUser = new RegisterRequest(
                "other@example.com",
                "Password123!",
                "Other User",
                "+9999999999"
        );

        MvcResult otherResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(otherUser)))
                .andExpect(status().isOk())
                .andReturn();

        String otherBody = otherResult.getResponse().getContentAsString();
        String otherToken = objectMapper.readTree(otherBody).get("token").asText();

        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What color?");
        request.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testNonExistentMatchReturns404() throws Exception {
        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What color?");
        request.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/99999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDuplicateVerificationPrevention() throws Exception {
        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What color is your lost backpack?");
        request.setAnswer("Blue");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    public void testPlaintextAnswerIsNeverPersisted() throws Exception {
        String plaintextAnswer = "SuperSecretAnswer123";

        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("Secret question?");
        request.setAnswer(plaintextAnswer);

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        OwnershipVerification verification = ownershipVerificationRepository.findByItemMatchId(matchId).get();
        String persistedHash = verification.getChallengeAnswerHash();

        org.junit.jupiter.api.Assertions.assertNotEquals(plaintextAnswer, persistedHash);
        org.junit.jupiter.api.Assertions.assertTrue(persistedHash.startsWith("$2a$"));
    }

    @Test
    public void testSensitiveDataNeverReturnedInResponse() throws Exception {
        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What is the secret code?");
        request.setAnswer("SecretCode123");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.challengeQuestion", is("What is the secret code?")))
                .andExpect(result -> {
                    String json = result.getResponse().getContentAsString();
                    org.junit.jupiter.api.Assertions.assertFalse(json.contains("challengeAnswerHash"));
                    org.junit.jupiter.api.Assertions.assertFalse(json.contains("SecretCode123"));
                });
    }

    @Test
    public void testAnswerIsCaseInsensitiveAndTrimmed() throws Exception {
        OwnershipVerificationRequest request = new OwnershipVerificationRequest();
        request.setChallengeQuestion("What color?");
        request.setAnswer("  Blue  ");

        mockMvc.perform(post("/api/verifications/match/" + matchId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Long verificationId = ownershipVerificationRepository.findByItemMatchId(matchId).get().getId();

        AnswerSubmissionRequest answerRequest = new AnswerSubmissionRequest();
        answerRequest.setAnswer("blue");

        mockMvc.perform(post("/api/verifications/" + verificationId + "/answer")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("VERIFIED")));
    }
}
