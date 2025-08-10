FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Prune dev deps while ignoring peer conflicts to match install step
RUN npm prune --omit=dev --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
