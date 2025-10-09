# 🍕 NYC Restaurant Safety Finder

[![GitHub Workflow Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/blob/main/LICENSE)
[![Java Version](https://img.shields.io/badge/java-21-blue.svg)](https://www.oracle.com/java/technologies/downloads/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)

A full-stack cloud application for querying NYC restaurant health inspection data. Features a production-ready Spring Boot REST API with comprehensive security, PostgreSQL database, and modern React frontend.

---

## 🧭 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Technology Stack](#-technology-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

The **NYC Restaurant Safety Finder** is a comprehensive web application that provides easy access to NYC health inspection data. The project showcases modern cloud-native application development with:

- **Secure REST API** built with Spring Boot
- **200,000+ inspection records** loaded from NYC Open Data
- **PostgreSQL database** running in Docker
- **Modern React frontend** for data visualization
- **Production-ready security** features (rate limiting, input validation, CORS, API keys)

### Purpose

- 🔍 **Search & Filter**: Find restaurants by borough, cuisine, and health grade
- 📊 **Data Insights**: Access detailed inspection history and violations
- 🛡️ **Secure Access**: Enterprise-grade security features
- 🎓 **Learning Resource**: Demonstrate cloud-native best practices

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│ React + Vite    │
│ TailwindCSS     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────┐
│   Spring Boot   │      │  PostgreSQL  │
│   REST API      │─────▶│   Database   │
│   (Port 8080)   │      │  (Docker)    │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Security      │
│ • Rate Limiting │
│ • Input Valid.  │
│ • CORS          │
│ • API Keys      │
└─────────────────┘
```

### Data Flow

1. **Data Loading**: `scripts/populate.sh` loads NYC data into PostgreSQL
2. **API Layer**: Spring Boot exposes secure REST endpoints
3. **Frontend**: React app queries API and displays results
4. **Security**: Multiple layers protect against common vulnerabilities

---

## ✨ Features

### API Features
- ✅ RESTful endpoints for restaurant queries
- ✅ Advanced search and filtering
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 req/min per IP)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Configurable CORS
- ✅ Optional API key authentication
- ✅ Comprehensive error handling
- ✅ Request/response logging

### Database Features
- ✅ Automatic data loading from NYC Open Data API
- ✅ 200,000+ restaurant inspection records
- ✅ Optimized indexes for fast queries
- ✅ Docker-based deployment

### Frontend Features
- ✅ Interactive search interface
- ✅ Filter by borough, cuisine, and grade
- ✅ Detailed inspection history
- ✅ Responsive design
- ✅ Real-time API integration

---

## 🚀 Quick Start

### Prerequisites

- **Java 21+**
- **Docker & Docker Compose**
- **Node.js 18+** (for frontend)
- **PostgreSQL** (via Docker)

### 1. Database Setup

```bash
# Start PostgreSQL and load data
cd scripts
./docker.sh
```

This will:
- Create a Docker network and volume
- Start PostgreSQL container
- Load NYC restaurant inspection data (~200K records)

### 2. API Setup

```bash
# Build the API
cd api
./gradlew clean build

# Run the API
java -jar build/libs/api-0.0.1-SNAPSHOT.jar
```

API will be available at `http://localhost:8080`

### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Test the API

```bash
# Health check
curl http://localhost:8080/api/restaurants/health

# Search for restaurants
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN", "cuisine": "Pizza", "limit": 10}'
```

---

## 📁 Project Structure

```
gdg-fsc-x-bc-cloud-workshop/
├── api/                          # Spring Boot REST API
│   ├── src/main/java/
│   │   └── com/example/api/
│   │       ├── config/           # Security, CORS configuration
│   │       ├── controller/       # REST endpoints
│   │       ├── dtos/             # Request/response objects
│   │       ├── entities/         # JPA entities
│   │       ├── implementations/  # Service implementations
│   │       ├── model/            # Enums and domain models
│   │       ├── repository/       # Data access layer
│   │       ├── service/          # Business logic interfaces
│   │       ├── util/             # Utility classes
│   │       └── web/              # Filters, error handlers
│   ├── build.gradle              # Dependencies
│   └── test-api.sh               # API testing script
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   └── lib/                  # Utilities
│   └── package.json
│
├── scripts/                      # Setup scripts
│   ├── docker.sh                 # PostgreSQL setup
│   └── populate.sh               # Data loader
│
└── docs/                         # Documentation
    ├── README.md                 # Documentation index
    ├── SUMMARY.md                # Table of contents
    ├── api/                      # API documentation
    │   ├── README.md
    │   ├── SECURITY.md
    │   ├── SECURITY_QUICK_REFERENCE.md
    │   ├── PACKAGE_STRUCTURE.md
    │   └── ADDITIONAL_COMPONENTS.md
    ├── database/                 # Database documentation
    │   └── README.md
    └── docker/                   # Docker documentation
        └── README.md
```

---

## 📚 Documentation

### Core Documentation
- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Table of Contents](docs/SUMMARY.md)** - Organized documentation structure

### Component Documentation

#### API & Backend
- **[API Overview](docs/api/README.md)** - API architecture, endpoints, and usage
- **[Security Guide](docs/api/SECURITY.md)** - Comprehensive security documentation
- **[Security Quick Reference](docs/api/SECURITY_QUICK_REFERENCE.md)** - Security quick start
- **[Package Structure](docs/api/PACKAGE_STRUCTURE.md)** - Code organization and patterns
- **[Additional Components](docs/api/ADDITIONAL_COMPONENTS.md)** - Enums, filters, and utilities

#### Infrastructure
- **[Database Guide](docs/database/README.md)** - Schema, queries, and data loading
- **[Docker Setup](docs/docker/README.md)** - Container configuration and troubleshooting

### Quick Links
- [API Endpoints](docs/api/README.md#api-endpoints)
- [Security Features](docs/api/SECURITY.md#-security-features-implemented)
- [Database Schema](docs/database/README.md)
- [Testing Guide](docs/api/README.md#testing-the-api)

---

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.6** - Application framework
- **Spring Data JPA** - Database access
- **Spring Security** - Authentication & authorization
- **PostgreSQL 18** - Database
- **Hibernate** - ORM
- **Bucket4j** - Rate limiting
- **Lombok** - Code generation
- **Gradle** - Build tool

### Frontend
- **React** - UI framework
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **Chakra UI** - Component library

### Infrastructure
- **Docker** - Containerization
- **PostgreSQL** - Production database
- **Bash** - Automation scripts

---

## 🔒 Security

The API implements multiple security layers:

- **Input Validation**: Regex patterns, length limits, SQL injection detection
- **Rate Limiting**: 100 requests/minute per IP address
- **Security Headers**: CSP, X-Frame-Options, X-XSS-Protection, etc.
- **CORS**: Configurable cross-origin resource sharing
- **API Keys**: Optional authentication layer
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **Error Handling**: No sensitive data exposure

**Learn more:** [Security Documentation](docs/api/SECURITY.md)

---

## 🧪 Testing

### Test the API

```bash
cd api
./test-api.sh
```

### Manual Testing

```bash
# Search restaurants
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "BROOKLYN", "cuisine": "Pizza", "minGrade": "A", "limit": 5}'

# Get restaurant details
curl -X POST http://localhost:8080/api/restaurants/details \
  -H "Content-Type: application/json" \
  -d '{"restaurantName": "PIZZA", "borough": "MANHATTAN"}'

# List boroughs
curl http://localhost:8080/api/restaurants/boroughs

# List cuisines
curl http://localhost:8080/api/restaurants/cuisines
```

### Security Testing

```bash
# Test rate limiting
for i in {1..150}; do curl http://localhost:8080/api/restaurants/health; done

# Test SQL injection protection
curl -X POST http://localhost:8080/api/restaurants/query \
  -H "Content-Type: application/json" \
  -d '{"borough": "MANHATTAN OR 1=1"}'
```

---

## 🤝 Contributing

This is a workshop project demonstrating cloud-native application development. Contributions are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop.git
cd gdg-fsc-x-bc-cloud-workshop

# Set up database
cd scripts && ./docker.sh && cd ..

# Build and run API
cd api && ./gradlew bootRun &

# Start frontend
cd ../frontend && npm install && npm run dev
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NYC Open Data** - For providing restaurant inspection data
- **GDSC FSC** - Google Developer Student Club at Farmingdale State College
- **Borough of Manhattan Community College** - Workshop partner
- **Spring Framework Team** - For excellent documentation
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/issues)
- **Documentation**: [docs/](docs/)
- **Security**: See [SECURITY.md](docs/api/SECURITY.md)

---

## 🗺️ Roadmap

### Current Features
- ✅ Full-stack application with secure API
- ✅ Comprehensive security features
- ✅ Docker-based deployment
- ✅ Complete documentation

### Future Enhancements
- [ ] Map visualization of restaurants
- [ ] User authentication and favorites
- [ ] Email alerts for new inspections
- [ ] Mobile app
- [ ] GraphQL API
- [ ] Real-time data updates
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

Made with ❤️ by GDSC FSC x BC Cloud Workshop
