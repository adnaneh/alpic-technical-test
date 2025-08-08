# Single stage build to reduce memory usage
FROM node:20-alpine

WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Install all dependencies with legacy peer deps to fix zod conflict
RUN NODE_OPTIONS="--max-old-space-size=512" npm install --legacy-peer-deps --verbose

# Copy source code
COPY . .

# Build the application
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Remove dev dependencies after build
RUN npm prune --production --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:prod"]