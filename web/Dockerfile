# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Ensure public directory exists
RUN mkdir -p public

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create public directory
RUN mkdir -p public

# Copy only necessary files for production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.js ./next.config.js

# Copy node_modules (only production dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy public directory (if exists)
COPY --from=builder /app/public ./public

# Copy the entire .next directory
COPY --from=builder /app/.next ./.next

# Expose Next.js port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"] 