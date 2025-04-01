# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy built app and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Expose Next.js port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"] 