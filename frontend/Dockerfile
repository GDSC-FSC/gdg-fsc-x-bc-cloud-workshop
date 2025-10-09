# Multi-stage build for React + Vite frontend
# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (including express for production)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Production runtime with Node.js
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S frontend && adduser -S frontend -G frontend

# Copy package.json and install production dependencies only
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built assets and server from build stage
COPY --from=build /app/dist ./dist
COPY server.js ./

# Change ownership to non-root user
RUN chown -R frontend:frontend /app

USER frontend:frontend

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the Express server
CMD ["node", "server.js"]
