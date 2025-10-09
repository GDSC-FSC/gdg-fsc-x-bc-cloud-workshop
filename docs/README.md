# GDG FSC x BC Cloud Workshop Documentation

Welcome to the documentation for the GDG FSC x BC Cloud Workshop project. This guide provides an overview of the project, its architecture, and instructions for setup and usage.

## Project Overview

This workshop demonstrates a full-stack cloud application using Docker, PostgreSQL, and modern frontend technologies. The backend loads NYC restaurant inspection data from the Socrata Open Data API into a PostgreSQL database, which is then accessed and visualized by the frontend.

### Key Components
- **Database:** Loads and manages NYC restaurant inspection data in PostgreSQL. See [Database Guide](database/README.md).
- **Docker:** Containerizes the database and services for easy setup and reproducibility. See [Docker Setup](docker/README.md).
- **Frontend:** Modern web UI for data exploration (see project root `frontend/`).
- **Backend/API:** Spring Boot Java API for data access (see project root `api/`).

## Getting Started

- To set up the database and load data, follow the [Database Guide](database/README.md).
- To run PostgreSQL in Docker, see the [Docker Setup](docker/README.md).
- For frontend and backend setup, refer to the respective READMEs in the project root.

## Resources
- [NYC Open Data: Restaurant Inspections](https://data.cityofnewyork.us/resource/43nn-pn8j.geojson)
- [Socrata API Docs](https://dev.socrata.com/docs/queries/limit.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/app-psql.html)
- [Docker Documentation](https://docs.docker.com/engine/network/)

---

For more details, see the [Table of Contents](SUMMARY.md).
