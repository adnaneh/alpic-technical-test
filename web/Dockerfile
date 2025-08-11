FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./

RUN npm ci --no-audit --no-fund

# Install arch-specific native addons for CSS tooling
ARG TARGETARCH
RUN set -eux; \
    arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    case "$arch" in \
      amd64) \
        npm install --no-save --no-package-lock lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu; \
        cp node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/lightningcss/ || true \
        ;; \
      arm64) \
        npm install --no-save --no-package-lock lightningcss-linux-arm64-gnu @tailwindcss/oxide-linux-arm64-gnu; \
        cp node_modules/lightningcss-linux-arm64-gnu/lightningcss.linux-arm64-gnu.node node_modules/lightningcss/ || true \
        ;; \
      *) echo "Unknown arch: $arch; skipping native add-ons" ;; \
    esac

FROM node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 libgcc-s1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 libgcc-s1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
