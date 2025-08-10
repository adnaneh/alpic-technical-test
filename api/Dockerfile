FROM node:20-alpine

WORKDIR /app

# Install dependencies reproducibly
COPY package*.json ./
# Use legacy peer deps to avoid peer resolution conflicts matching local installs
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Prune dev dependencies for production image size
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
