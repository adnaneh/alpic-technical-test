# Single stage build to reduce memory usage
FROM node:20-alpine

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies with memory limit
RUN NODE_OPTIONS="--max-old-space-size=512" npm install --verbose

# Copy source code
COPY . .

# No build-time env vars needed since we're using server-side proxy

# Build Next.js app
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Remove dev dependencies (but keep http-proxy for runtime)
RUN npm prune --production

EXPOSE 3000

# Use the custom server that handles WebSocket proxying
CMD ["node", "server.js"]