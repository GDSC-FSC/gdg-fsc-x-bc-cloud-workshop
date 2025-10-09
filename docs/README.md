# GDG FSC x BC Cloud Workshop Documentation

Welcome to the documentation for the GDG FSC x BC Cloud Workshop project. This guide provides an overview of the project, its architecture, and instructions for setup and usage.

## 🚀 New Here?

**Start with the [Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes!

## Project Overview

This workshop demonstrates a full-stack cloud application using Docker, PostgreSQL, Spring Boot, and modern frontend technologies. The project showcases a complete production-ready REST API with comprehensive security features for querying NYC restaurant inspection data.

### Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│  Spring Boot│─────▶│  PostgreSQL  │
│  (React/    │◀─────│     API     │◀─────│   Database   │
│   Vite)     │      │   (Java 21) │      │  (Docker)    │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Security   │
                     │  • Rate Limit│
                     │  • Input Val │
                     │  • CORS      │
                     │  • API Keys  │
                     └──────────────┘
```

### Key Components

- **Database:** Loads and manages NYC restaurant inspection data in PostgreSQL. See [Database Guide](database/README.md).
- **Docker:** Containerizes the database and services for easy setup and reproducibility. See [Docker Setup](docker/README.md).
- **API (Backend):** Spring Boot REST API with comprehensive security features. See [API Documentation](api/README.md).
- **Frontend:** Modern React/Vite web UI for data exploration (see project root `frontend/`).

## Getting Started

### Quick Start (Recommended Order)

1. **Database Setup:** Follow the [Database Guide](database/README.md) to set up PostgreSQL with Docker
2. **API Setup:** Follow the [API Documentation](api/README.md) to build and run the Spring Boot API
3. **Frontend Setup:** Refer to `frontend/README.md` in the project root to start the web interface

### Component-Specific Guides

- **Scripts & Utilities:** [Scripts Guide](scripts/README.md)
  - Bash scripts, npm scripts, and bash aliases
  - Three ways to run every command
  - Concurrent development with `npm run start:all`
- **Database & Data Loading:** [Database Guide](database/README.md)
- **Docker Configuration:** [Docker Setup](docker/README.md)
- **Frontend Development:** [Frontend Guide](frontend/README.md)
- **API Development & Security:** [API Documentation](api/README.md)
  - [Security Features](api/SECURITY.md)
  - [Security Quick Reference](api/SECURITY_QUICK_REFERENCE.md)
  - [Package Structure](api/PACKAGE_STRUCTURE.md)
  - [Additional Components](api/ADDITIONAL_COMPONENTS.md)

## Technology Stack

### Backend
- **Spring Boot 3.5.6** - Application framework
- **Spring Data JPA** - Database access
- **Spring Security** - Authentication & authorization
- **PostgreSQL** - Database
- **Hibernate** - ORM
- **Bucket4j** - Rate limiting
- **Lombok** - Code generation
- **Gradle** - Build tool

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Chakra UI** - Component library

### Infrastructure
- **Docker** - Containerization
- **PostgreSQL 18** - Production-grade database

## Features

### API Features
✅ RESTful endpoints for restaurant data  
✅ Advanced search and filtering  
✅ Input validation and sanitization  
✅ Rate limiting (100 req/min per IP)  
✅ SQL injection prevention  
✅ XSS protection  
✅ Security headers (CSP, X-Frame-Options, etc.)  
✅ CORS configuration  
✅ Optional API key authentication  
✅ Comprehensive error handling  
✅ Request/response logging  

### Database Features
✅ Automatic data loading from NYC Open Data API  
✅ 200,000+ restaurant inspection records  
✅ Optimized indexes for fast queries  
✅ Docker-based deployment  

## Resources

### External Resources
- [NYC Open Data: Restaurant Inspections](https://data.cityofnewyork.us/resource/43nn-pn8j.geojson)
- [Socrata API Docs](https://dev.socrata.com/docs/queries/limit.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/app-psql.html)
- [Docker Documentation](https://docs.docker.com/engine/network/)
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)

### Project Documentation
- [Full Table of Contents](SUMMARY.md)
- [Scripts & Utilities](scripts/README.md)
- [Database Schema & Queries](database/README.md)
- [Docker Setup & Troubleshooting](docker/README.md)
- [Frontend Development & Deployment](frontend/README.md)
- [API Architecture & Endpoints](api/README.md)
- [Security Implementation](api/SECURITY.md)

## Contributing

This is a workshop project demonstrating cloud-native application development. Feel free to:
- Explore the codebase
- Try different security configurations
- Extend the API with new endpoints
- Improve the frontend UI
- Add new features

## License

MIT License - See project root for details.
