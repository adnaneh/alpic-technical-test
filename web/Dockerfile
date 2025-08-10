FROM node:20-slim

WORKDIR /app

# Ensure base runtime libs for native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 libgcc-s1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install all deps including dev (Next/Tailwind build-time)
# Keep NODE_ENV=production for consistent Next behavior, but force dev deps
ENV NODE_ENV=production
RUN npm install --include=dev

# Ensure the correct Lightning CSS native binary is present for the
# current architecture to avoid runtime resolution issues during build.
# Uses TARGETARCH when available, otherwise infers via dpkg.
ARG TARGETARCH
RUN set -eux; \
    arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    case "$arch" in \
      amd64) npm install lightningcss-linux-x64-gnu --no-save && cp node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/lightningcss/ || true ;; \
      arm64) npm install lightningcss-linux-arm64-gnu --no-save && cp node_modules/lightningcss-linux-arm64-gnu/lightningcss.linux-arm64-gnu.node node_modules/lightningcss/ || true ;; \
      *) echo "Unknown arch: $arch; skipping lightningcss native add-on pin" ;; \
    esac

# Ensure PostCSS build plugins are present even if dev deps are omitted
RUN npm install @tailwindcss/postcss@^4 postcss@^8 autoprefixer@^10 --no-save

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

RUN npm prune --omit=dev

# Switch final container runtime to production
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
