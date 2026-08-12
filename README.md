# 🔎 FindBack — Lost & Found AI

**FindBack** is an AI-powered Lost & Found platform that helps users report lost or found items, discover potential matches, and verify ownership securely.

The platform combines **rule-based intelligent matching, image similarity, JWT authentication, and ownership verification** to make the process of recovering lost belongings faster and more reliable.

## ✨ Features

* 🔐 **User Authentication**

  * User registration and login
  * JWT-based authentication
  * BCrypt password hashing
  * Role-based access control (`USER`, `ADMIN`)

* 📦 **Lost & Found Item Management**

  * Report lost items
  * Report found items
  * Add item details such as category, color, description, location, and time
  * Image upload support

* 🤖 **Intelligent Matching Engine**

  * Matches lost and found items using multiple attributes
  * Category similarity
  * Color similarity
  * Description similarity
  * Location similarity
  * Time proximity
  * Image similarity

* 🖼️ **Image Matching**

  * Supports JPEG, PNG, GIF, and WebP images
  * Image comparison layer for potential item matches
  * Basic image similarity using resized grayscale image comparison

* 🛡️ **Ownership Verification**

  * Challenge-question based verification
  * Securely hashed verification answers using BCrypt
  * Verification status tracking

* 📊 **Dashboard**

  * Lost items
  * Found items
  * Potential matches
  * Verification information

* 🗄️ **Database Integration**

  * MySQL
  * Spring Data JPA
  * Hibernate

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* JavaScript
* HTML5
* CSS3

### Backend

* Java 17
* Spring Boot 3.3.2
* Spring Security
* Spring Data JPA
* Hibernate
* REST APIs
* JWT
* BCrypt
* Maven

### Database

* MySQL

### Development Tools

* Git & GitHub
* VS Code
* Postman
* MySQL Workbench

## 🏗️ Project Structure

```text
FindBack/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml
│   └── ...
│
├── .gitignore
└── README.md
```

## 🧠 Matching Engine

FindBack calculates a matching score between lost and found items using multiple signals.

| Attribute        | Weight |
| ---------------- | -----: |
| Category         |    15% |
| Color            |    10% |
| Description      |    25% |
| Location         |    15% |
| Time             |    10% |
| Image Similarity |    25% |

The final score is used to identify potential matches between reported lost and found items.

The current matching threshold is **40%**.

## 🔐 Authentication

The backend uses Spring Security with JWT authentication.

Public endpoints include:

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
```

Protected API endpoints require authentication.

Passwords are securely stored using **BCrypt hashing**.

## 🖼️ Image Upload

Supported image formats:

```text
JPEG
PNG
GIF
WebP
```

Maximum supported file size:

```text
5 MB
```

Uploaded images are associated with the corresponding lost/found item.

## 🛡️ Ownership Verification

FindBack provides an additional ownership verification workflow before an item is considered successfully recovered.

The workflow includes:

1. Create an ownership verification request.
2. Generate a challenge question.
3. Store the verification answer securely using BCrypt.
4. Submit the user's answer.
5. Validate the answer.
6. Track the verification status.

This helps prevent false ownership claims.

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Java 17+
* Node.js
* npm
* MySQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/avikachaudhary0808-cell/Lost-Found-AI-FindBack-.git
```

```bash
cd Lost-Found-AI-FindBack-
```

## ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Configure your MySQL database in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/findback?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Then start the backend:

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs by default on:

```text
http://localhost:8080
```

## 💻 Frontend Setup

Open another terminal and navigate to:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

> If port 5173 is already occupied, Vite may automatically start on another available port such as 5174.

## 🧪 Testing

The backend includes unit and integration tests covering authentication, matching, image similarity, and ownership verification.

Run the test suite:

```powershell
cd backend
.\mvnw.cmd test
```

## 🔌 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Health Check

```text
GET /api/health
```

### Lost Items

```text
/api/lost-items
```

### Found Items

```text
/api/found-items
```

### Matching

```text
/api/matches
```

### Ownership Verification

```text
/api/verifications
```

> Exact endpoint availability may depend on the current backend implementation.

## 🔒 Security

FindBack uses:

* JWT authentication
* BCrypt password hashing
* Spring Security
* Role-based authorization
* Protected API endpoints
* Secure ownership verification

### Environment Variables & Secrets

Do **not** commit sensitive credentials or API keys to GitHub.

Keep values such as:

```text
Database passwords
JWT secrets
API keys
Private credentials
```

outside the repository using environment variables or local configuration.

## 📈 Future Improvements

* Advanced AI/ML-based image matching
* Face/object recognition for item identification
* Real-time notifications
* Email/SMS notifications
* Location-based search using maps
* Admin moderation dashboard
* Cloud image storage
* Improved semantic description matching
* Mobile application

## 👩‍💻 Developer

**Avika Chaudhary**

B.Tech — Computer Science & Engineering

Meerut Institute of Engineering and Technology

### Project

**FindBack — Lost & Found AI Platform**

Built using React, Spring Boot, MySQL, Spring Security, JWT, Hibernate, and intelligent matching techniques.

## 📄 License

This project is developed for educational and portfolio purposes.
