FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

# Install with devDependencies to satisfy Next/Tailwind build plugins
RUN npm install --include=dev

# Ensure the correct Lightning CSS native binary is present for the
# current architecture to avoid runtime resolution issues during build.
# Uses TARGETARCH when available, otherwise infers via dpkg.
ARG TARGETARCH
RUN set -eux; \
    arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    case "$arch" in \
      amd64) npm install lightningcss-linux-x64-gnu --no-save ;; \
      arm64) npm install lightningcss-linux-arm64-gnu --no-save ;; \
      *) echo "Unknown arch: $arch; skipping lightningcss native add-on pin" ;; \
    esac

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
