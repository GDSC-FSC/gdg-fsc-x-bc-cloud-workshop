# Multi-stage build for React + Vite frontend
# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8080
ARG VITE_GOOGLE_MAPS_API_KEY

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Build the application
RUN bun run build

# Stage 2: Production runtime with Node.js
FROM node:20-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Create non-root user for security
RUN addgroup -S frontend && \
    adduser -S frontend -G frontend && \
    chown -R frontend:frontend /app

# Copy package.json and install production dependencies only
COPY --chown=frontend:frontend package.json ./
RUN npm install --omit=dev express && \
    npm cache clean --force

# Copy built assets and server from build stage
COPY --from=build --chown=frontend:frontend /app/dist ./dist
COPY --chown=frontend:frontend server.js ./

USER frontend

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
