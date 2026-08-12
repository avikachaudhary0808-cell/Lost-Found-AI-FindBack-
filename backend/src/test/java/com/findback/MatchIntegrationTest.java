package com.findback;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findback.dto.FoundItemRequest;
import com.findback.dto.LostItemRequest;
import com.findback.dto.RegisterRequest;
import com.findback.entity.FoundItem;
import com.findback.entity.ItemMatch;
import com.findback.entity.LostItem;
import com.findback.repository.FoundItemRepository;
import com.findback.repository.ItemMatchRepository;
import com.findback.repository.LostItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;

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
public class MatchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private ItemMatchRepository itemMatchRepository;

    private String jwtToken;
    private Long userId;
    private Long lostItemId;

    @BeforeEach
    public void setup() throws Exception {
        itemMatchRepository.deleteAll();
        foundItemRepository.deleteAll();
        lostItemRepository.deleteAll();

        RegisterRequest registerRequest = new RegisterRequest(
                "match.user@example.com",
                "Password123!",
                "Match User",
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
                    "match.user@example.com", "Password123!"
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
    }

    @Test
    public void testHighScoreMatch() throws Exception {
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

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].matchScore", greaterThanOrEqualTo(40.0)))
                .andExpect(jsonPath("$[0].matchStatus", notNullValue()))
                .andExpect(jsonPath("$[0].foundItemId", notNullValue()))
                .andExpect(jsonPath("$[0].title", notNullValue()))
                .andExpect(jsonPath("$[0].category", notNullValue()))
                .andExpect(jsonPath("$[0].color", notNullValue()))
                .andExpect(jsonPath("$[0].approximateLocation", notNullValue()))
                .andExpect(jsonPath("$[0].reportedAt", notNullValue()));
    }

    @Test
    public void testLowScoreIgnored() throws Exception {
        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Red Laptop");
        foundRequest.setDescription("Dell red laptop found in cafeteria");
        foundRequest.setCategory("Electronics");
        foundRequest.setColor("Red");
        foundRequest.setApproximateLocation("Cafeteria");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void testCategoryMismatchLowersScore() throws Exception {
        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Blue Water Bottle");
        foundRequest.setDescription("Blue steel water bottle found near library");
        foundRequest.setCategory("Accessories");
        foundRequest.setColor("Blue");
        foundRequest.setApproximateLocation("Central Library");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void testDuplicateMatchPrevention() throws Exception {
        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Blue Backpack");
        foundRequest.setDescription("Nike blue backpack with laptop compartment");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Blue");
        foundRequest.setApproximateLocation("Central Library");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        LostItem lostItem = lostItemRepository.findById(lostItemId)
                .orElseThrow(() -> new AssertionError("Lost item not found"));
        long matchCount = itemMatchRepository.findByLostItemId(lostItemId).size();
        org.junit.jupiter.api.Assertions.assertEquals(1L, matchCount, "Duplicate ItemMatch rows should not be created");
    }

    @Test
    public void testUnauthorizedAccess() throws Exception {
        RegisterRequest otherUser = new RegisterRequest(
                "other.user@example.com",
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

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testMatchScoreSorting() throws Exception {
        FoundItemRequest highMatch = new FoundItemRequest();
        highMatch.setTitle("Blue Backpack Exact");
        highMatch.setDescription("Nike blue backpack with laptop compartment found at central library");
        highMatch.setCategory("Bags");
        highMatch.setColor("Blue");
        highMatch.setApproximateLocation("Central Library");

        MvcResult highResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(highMatch)))
                .andExpect(status().isCreated())
                .andReturn();

        FoundItemRequest mediumMatch = new FoundItemRequest();
        mediumMatch.setTitle("Blue Bag");
        mediumMatch.setDescription("Blue bag found near library");
        mediumMatch.setCategory("Bags");
        mediumMatch.setColor("Blue");
        mediumMatch.setApproximateLocation("Central Library");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mediumMatch)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].matchScore", greaterThanOrEqualTo(40.0)))
                .andExpect(jsonPath("$[0].matchStatus", notNullValue()));
    }

    @Test
    public void testBothItemsWithoutImages() throws Exception {
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

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].imageSimilarityScore", nullValue()));
    }

    @Test
    public void testOneItemWithoutImage() throws Exception {
        byte[] imageBytes = createTestImageBytes(50, 50, Color.BLUE);
        MockMultipartFile lostImage = new MockMultipartFile(
                "image",
                "lost-image.jpg",
                "image/jpeg",
                imageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + lostItemId + "/image")
                        .file(lostImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Blue Backpack Found");
        foundRequest.setDescription("Nike blue backpack found near library");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Blue");
        foundRequest.setApproximateLocation("Central Library");

        MvcResult foundResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String foundBody = foundResult.getResponse().getContentAsString();
        Long foundItemId = objectMapper.readTree(foundBody).get("id").asLong();

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].imageSimilarityScore", nullValue()));
    }

    @Test
    public void testBothItemsWithSameImage() throws Exception {
        byte[] imageBytes = createTestImageBytes(50, 50, Color.RED);

        MockMultipartFile lostImage = new MockMultipartFile(
                "image",
                "lost-image.jpg",
                "image/jpeg",
                imageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + lostItemId + "/image")
                        .file(lostImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Red Backpack Found");
        foundRequest.setDescription("Red backpack found near library");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Red");
        foundRequest.setApproximateLocation("Central Library");

        MvcResult foundResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String foundBody = foundResult.getResponse().getContentAsString();
        Long foundItemId = objectMapper.readTree(foundBody).get("id").asLong();

        MockMultipartFile foundImage = new MockMultipartFile(
                "image",
                "found-image.jpg",
                "image/jpeg",
                imageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/found-items/" + foundItemId + "/image")
                        .file(foundImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].imageSimilarityScore", greaterThanOrEqualTo(80.0)));
    }

    @Test
    public void testBothItemsWithDifferentImages() throws Exception {
        byte[] lostImageBytes = createTestImageBytes(50, 50, Color.WHITE);
        byte[] foundImageBytes = createTestImageBytes(50, 50, Color.BLACK);

        MockMultipartFile lostImage = new MockMultipartFile(
                "image",
                "lost-image.jpg",
                "image/jpeg",
                lostImageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + lostItemId + "/image")
                        .file(lostImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Blue Backpack Found");
        foundRequest.setDescription("Blue backpack found near library");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Blue");
        foundRequest.setApproximateLocation("Central Library");

        MvcResult foundResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String foundBody = foundResult.getResponse().getContentAsString();
        Long foundItemId = objectMapper.readTree(foundBody).get("id").asLong();

        MockMultipartFile foundImage = new MockMultipartFile(
                "image",
                "found-image.jpg",
                "image/jpeg",
                foundImageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/found-items/" + foundItemId + "/image")
                        .file(foundImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].imageSimilarityScore", lessThan(50.0)));
    }

    @Test
    public void testImageSimilarityAffectsFinalScore() throws Exception {
        byte[] imageBytes = createTestImageBytes(50, 50, Color.RED);

        MockMultipartFile lostImage = new MockMultipartFile(
                "image",
                "lost-image.jpg",
                "image/jpeg",
                imageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + lostItemId + "/image")
                        .file(lostImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        FoundItemRequest foundRequest = new FoundItemRequest();
        foundRequest.setTitle("Red Backpack Found");
        foundRequest.setDescription("Red backpack found near library");
        foundRequest.setCategory("Bags");
        foundRequest.setColor("Red");
        foundRequest.setApproximateLocation("Central Library");

        MvcResult foundResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String foundBody = foundResult.getResponse().getContentAsString();
        Long foundItemId = objectMapper.readTree(foundBody).get("id").asLong();

        MockMultipartFile foundImage = new MockMultipartFile(
                "image",
                "found-image.jpg",
                "image/jpeg",
                imageBytes
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/found-items/" + foundItemId + "/image")
                        .file(foundImage)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/matches/lost/" + lostItemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].imageSimilarityScore", greaterThanOrEqualTo(80.0)))
                .andExpect(jsonPath("$[0].matchScore", greaterThanOrEqualTo(60.0)));
    }

    private byte[] createTestImageBytes(int width, int height, Color color) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setPaint(color);
        g.fillRect(0, 0, width, height);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        return baos.toByteArray();
    }
}
