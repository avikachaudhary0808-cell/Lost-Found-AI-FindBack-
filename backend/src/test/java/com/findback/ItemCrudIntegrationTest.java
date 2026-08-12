package com.findback;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findback.dto.FoundItemRequest;
import com.findback.dto.LoginRequest;
import com.findback.dto.LostItemRequest;
import com.findback.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class ItemCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;
    private Long userId;

    @BeforeEach
    public void setup() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "item.owner@example.com",
                "Password123!",
                "Item Owner",
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
                    "item.owner@example.com", "Password123!"
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
    }

    @Test
    public void testLostItemCrudFlow() throws Exception {
        // 1. Create lost item
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Blue Backpack");
        createRequest.setDescription("Nike backpack with laptop compartment");
        createRequest.setCategory("Bags");
        createRequest.setColor("Blue");
        createRequest.setApproximateLocation("Central Library");

        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Blue Backpack"))
                .andExpect(jsonPath("$.category").value("Bags"))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.status").value("LOST"))
                .andExpect(jsonPath("$.id", notNullValue()));

        // 2. Get all lost items
        mockMvc.perform(get("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].title", hasItem("Blue Backpack")));

        // 3. Get lost item by id
        MvcResult getResult = mockMvc.perform(get("/api/lost-items/1")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String getBody = getResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(getBody).get("id").asLong();

        // 4. Update lost item
        LostItemRequest updateRequest = new LostItemRequest();
        updateRequest.setTitle("Blue Backpack - Updated");
        updateRequest.setDescription("Updated description");
        updateRequest.setCategory("Bags");
        updateRequest.setColor("Blue");
        updateRequest.setApproximateLocation("Main Campus");

        mockMvc.perform(put("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Blue Backpack - Updated"))
                .andExpect(jsonPath("$.approximateLocation").value("Main Campus"));

        // 5. Delete lost item
        mockMvc.perform(delete("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // 6. Verify deleted
        mockMvc.perform(get("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testFoundItemCrudFlow() throws Exception {
        // 1. Create found item
        FoundItemRequest createRequest = new FoundItemRequest();
        createRequest.setTitle("Gold Watch");
        createRequest.setDescription("Seiko gold watch found near fountain");
        createRequest.setCategory("Accessories");
        createRequest.setColor("Gold");
        createRequest.setApproximateLocation("Fountain Area");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Gold Watch"))
                .andExpect(jsonPath("$.category").value("Accessories"))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.status").value("FOUND"))
                .andExpect(jsonPath("$.id", notNullValue()));

        // 2. Get all found items
        mockMvc.perform(get("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].title", hasItem("Gold Watch")));

        // 3. Get found item by id
        MvcResult getResult = mockMvc.perform(get("/api/found-items/1")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andReturn();

        String getBody = getResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(getBody).get("id").asLong();

        // 4. Update found item
        FoundItemRequest updateRequest = new FoundItemRequest();
        updateRequest.setTitle("Gold Watch - Updated");
        updateRequest.setDescription("Updated description");
        updateRequest.setCategory("Accessories");
        updateRequest.setColor("Gold");
        updateRequest.setApproximateLocation("Admin Block");

        mockMvc.perform(put("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Gold Watch - Updated"))
                .andExpect(jsonPath("$.approximateLocation").value("Admin Block"));

        // 5. Delete found item
        mockMvc.perform(delete("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());

        // 6. Verify deleted
        mockMvc.perform(get("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testLostItemValidationFailure() throws Exception {
        LostItemRequest invalidRequest = new LostItemRequest();
        invalidRequest.setTitle("");
        invalidRequest.setDescription("");
        invalidRequest.setCategory("");
        invalidRequest.setColor("");
        invalidRequest.setApproximateLocation("");

        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", notNullValue()))
                .andExpect(jsonPath("$.description", notNullValue()))
                .andExpect(jsonPath("$.category", notNullValue()))
                .andExpect(jsonPath("$.color", notNullValue()))
                .andExpect(jsonPath("$.approximateLocation", notNullValue()));
    }

    @Test
    public void testFoundItemValidationFailure() throws Exception {
        FoundItemRequest invalidRequest = new FoundItemRequest();
        invalidRequest.setTitle("");
        invalidRequest.setDescription("");
        invalidRequest.setCategory("");
        invalidRequest.setColor("");
        invalidRequest.setApproximateLocation("");

        mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", notNullValue()))
                .andExpect(jsonPath("$.description", notNullValue()))
                .andExpect(jsonPath("$.category", notNullValue()))
                .andExpect(jsonPath("$.color", notNullValue()))
                .andExpect(jsonPath("$.approximateLocation", notNullValue()));
    }

    @Test
    public void testLostItemOwnershipViolation() throws Exception {
        // Create item as owner
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Red Wallet");
        createRequest.setDescription("Brown leather wallet");
        createRequest.setCategory("Wallets");
        createRequest.setColor("Brown");
        createRequest.setApproximateLocation("Cafeteria");

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        // Register a second user and get their token
        RegisterRequest secondUser = new RegisterRequest(
                "thief@example.com",
                "Password123!",
                "Thief User",
                "+9876543210"
        );

        MvcResult secondUserResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondUser)))
                .andExpect(status().isOk())
                .andReturn();

        String secondUserBody = secondUserResult.getResponse().getContentAsString();
        String thiefToken = objectMapper.readTree(secondUserBody).get("token").asText();

        // Try to update with different user's token - should be 403
        LostItemRequest updateRequest = new LostItemRequest();
        updateRequest.setTitle("Stolen Wallet");
        updateRequest.setDescription("Hacked");
        updateRequest.setCategory("Wallets");
        updateRequest.setColor("Brown");
        updateRequest.setApproximateLocation("Hacker Den");

        mockMvc.perform(put("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + thiefToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());

        // Try to delete with different user's token - should be 403
        mockMvc.perform(delete("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + thiefToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testFoundItemOwnershipViolation() throws Exception {
        // Create item as owner
        FoundItemRequest createRequest = new FoundItemRequest();
        createRequest.setTitle("Silver Keychain");
        createRequest.setDescription("Toyota keychain");
        createRequest.setCategory("Keys");
        createRequest.setColor("Silver");
        createRequest.setApproximateLocation("Parking Lot");

        MvcResult createResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        // Register a second user and get their token
        RegisterRequest secondUser = new RegisterRequest(
                "imposter@example.com",
                "Password123!",
                "Imposter User",
                "+5555555555"
        );

        MvcResult secondUserResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondUser)))
                .andExpect(status().isOk())
                .andReturn();

        String secondUserBody = secondUserResult.getResponse().getContentAsString();
        String imposterToken = objectMapper.readTree(secondUserBody).get("token").asText();

        // Try to update with different user's token - should be 403
        FoundItemRequest updateRequest = new FoundItemRequest();
        updateRequest.setTitle("Stolen Keychain");
        updateRequest.setDescription("Hacked");
        updateRequest.setCategory("Keys");
        updateRequest.setColor("Silver");
        updateRequest.setApproximateLocation("Hacker Den");

        mockMvc.perform(put("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + imposterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());

        // Try to delete with different user's token - should be 403
        mockMvc.perform(delete("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + imposterToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testLostItemNotFound() throws Exception {
        mockMvc.perform(get("/api/lost-items/99999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/lost-items/99999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"test\",\"description\":\"test\",\"category\":\"test\",\"color\":\"test\",\"approximateLocation\":\"test\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/lost-items/99999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testFoundItemNotFound() throws Exception {
        mockMvc.perform(get("/api/found-items/99999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/found-items/99999")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"test\",\"description\":\"test\",\"category\":\"test\",\"color\":\"test\",\"approximateLocation\":\"test\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/found-items/99999")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testLostItemImageUploadValid() throws Exception {
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Blue Backpack");
        createRequest.setDescription("Nike backpack");
        createRequest.setCategory("Bags");
        createRequest.setColor("Blue");
        createRequest.setApproximateLocation("Central Library");

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "backpack.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + itemId + "/image")
                        .file(image)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath", notNullValue()))
                .andExpect(jsonPath("$.imagePath", org.hamcrest.Matchers.containsString("lost-items/")))
                .andExpect(jsonPath("$.imagePath", org.hamcrest.Matchers.endsWith(".jpg")));

        mockMvc.perform(get("/api/lost-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath", notNullValue()));
    }

    @Test
    public void testFoundItemImageUploadValid() throws Exception {
        FoundItemRequest createRequest = new FoundItemRequest();
        createRequest.setTitle("Gold Watch");
        createRequest.setDescription("Seiko gold watch");
        createRequest.setCategory("Accessories");
        createRequest.setColor("Gold");
        createRequest.setApproximateLocation("Fountain Area");

        MvcResult createResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "watch.png",
                MediaType.IMAGE_PNG_VALUE,
                "test image content".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/found-items/" + itemId + "/image")
                        .file(image)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath", notNullValue()))
                .andExpect(jsonPath("$.imagePath", org.hamcrest.Matchers.containsString("found-items/")))
                .andExpect(jsonPath("$.imagePath", org.hamcrest.Matchers.endsWith(".png")));

        mockMvc.perform(get("/api/found-items/" + itemId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath", notNullValue()));
    }

    @Test
    public void testLostItemImageUploadInvalidType() throws Exception {
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Blue Backpack");
        createRequest.setDescription("Nike backpack");
        createRequest.setCategory("Bags");
        createRequest.setColor("Blue");
        createRequest.setApproximateLocation("Central Library");

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        MockMultipartFile invalidImage = new MockMultipartFile(
                "image",
                "backpack.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "this is not an image".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + itemId + "/image")
                        .file(invalidImage)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testFoundItemImageUploadInvalidType() throws Exception {
        FoundItemRequest createRequest = new FoundItemRequest();
        createRequest.setTitle("Gold Watch");
        createRequest.setDescription("Seiko gold watch");
        createRequest.setCategory("Accessories");
        createRequest.setColor("Gold");
        createRequest.setApproximateLocation("Fountain Area");

        MvcResult createResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        MockMultipartFile invalidImage = new MockMultipartFile(
                "image",
                "watch.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "this is not an image".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/found-items/" + itemId + "/image")
                        .file(invalidImage)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testLostItemImageUploadOversized() throws Exception {
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Blue Backpack");
        createRequest.setDescription("Nike backpack");
        createRequest.setCategory("Bags");
        createRequest.setColor("Blue");
        createRequest.setApproximateLocation("Central Library");

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        byte[] oversizedContent = new byte[6 * 1024 * 1024];
        MockMultipartFile oversizedImage = new MockMultipartFile(
                "image",
                "backpack.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                oversizedContent
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + itemId + "/image")
                        .file(oversizedImage)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testImageServing() throws Exception {
        LostItemRequest createRequest = new LostItemRequest();
        createRequest.setTitle("Blue Backpack");
        createRequest.setDescription("Nike backpack");
        createRequest.setCategory("Bags");
        createRequest.setColor("Blue");
        createRequest.setApproximateLocation("Central Library");

        MvcResult createResult = mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String createBody = createResult.getResponse().getContentAsString();
        Long itemId = objectMapper.readTree(createBody).get("id").asLong();

        MockMultipartFile image = new MockMultipartFile(
                "image",
                "served.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "servable image".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(MockMvcRequestBuilders.multipart("/api/lost-items/" + itemId + "/image")
                        .file(image)
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA_VALUE))
                .andExpect(status().isOk())
                .andReturn();

        String uploadBody = uploadResult.getResponse().getContentAsString();
        String imagePath = objectMapper.readTree(uploadBody).get("imagePath").asText();

        mockMvc.perform(get("/api/images/" + imagePath))
                .andExpect(status().isOk());
    }
}
