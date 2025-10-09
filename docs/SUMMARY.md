# Table of Contents

## Overview
- [Project Introduction](README.md)
  - Architecture overview
  - Technology stack
  - Key features
  - Getting started

## Development Tools

### Scripts
- [Scripts Guide](scripts/README.md)
  - Development scripts (dev, build, clean)
  - Database scripts (setup, seed)
  - Frontend management
  - Testing utilities
  - Installation guide

## Infrastructure

### Database
- [Database Guide](database/README.md)
  - Overview of data loading and schema
  - How to run the loader script
  - Example queries and tips
  - Table structure and indexes

### Docker
- [Docker Setup](docker/README.md)
  - Setting up PostgreSQL in Docker
  - Creating networks and volumes
  - Troubleshooting tips
  - Container management
  - Docker Compose usage

## Backend API

### Core Documentation
- [API Overview](api/README.md)
  - Architecture & design
  - API endpoints
  - Building & running
  - Configuration
  - Testing

### Architecture & Design
- [Package Structure](api/PACKAGE_STRUCTURE.md)
  - Complete package overview
  - Design patterns
  - Component interactions
  - Request flow diagrams

- [Additional Components](api/ADDITIONAL_COMPONENTS.md)
  - Model package (enums)
  - Implementations package
  - Web package components
  - Benefits and usage examples

### Security
- [Security Documentation](api/SECURITY.md)
  - Security features overview
  - Input validation & sanitization
  - Rate limiting
  - Security headers
  - CORS configuration
  - API key authentication
  - SQL injection prevention
  - Production checklist
  - Incident response

- [Security Quick Reference](api/SECURITY_QUICK_REFERENCE.md)
  - Quick start guide
  - Configuration examples
  - Testing commands
  - Common issues
  - Production checklist

## Frontend

- [Frontend Guide](frontend/README.md)
  - React + Vite setup
  - Development workflow
  - Production builds
  - Docker deployment
  - Multi-stage builds
  - Environment configuration
  - Component structure
  - API integration
  - Troubleshooting

## Development

### Getting Started
1. [Install Dependencies](scripts/README.md#-quick-start) - Install Docker, Bun, etc.
2. [Start Development Environment](scripts/README.md#development) - Run dev.sh
3. [Database Setup](database/README.md) - Set up PostgreSQL
4. [API Setup](api/README.md) - Build and run the API
5. [Frontend Setup](../frontend/README.md) - Start the web interface

### Testing
- [API Testing](api/README.md#testing-the-api) - Test scripts and examples
- [Security Testing](api/SECURITY.md#-security-testing) - Security validation tests

### Deployment
- [Docker Deployment](docker/README.md) - Container-based deployment
- [API Configuration](api/README.md#configuration) - Production settings
- [Security Configuration](api/SECURITY.md#-security-checklist) - Security hardening

## Resources

### External Documentation
- [NYC Open Data API](https://data.cityofnewyork.us/resource/43nn-pn8j.geojson)
- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/current/)
- [Docker Docs](https://docs.docker.com/)

### Project Resources
- Repository: [GDSC-FSC/gdg-fsc-x-bc-cloud-workshop](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop)
- Issues: [GitHub Issues](https://github.com/GDSC-FSC/gdg-fsc-x-bc-cloud-workshop/issues)
- License: MIT
