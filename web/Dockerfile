FROM --platform=linux/amd64 node:20-slim AS deps
WORKDIR /app
COPY package*.json ./

RUN npm ci --no-audit --no-fund


RUN npm install --no-save --no-package-lock \
      lightningcss-linux-x64-gnu \
      @tailwindcss/oxide-linux-x64-gnu \
  && cp node_modules/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/lightningcss/ || true

FROM --platform=linux/amd64 node:20-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 libgcc-s1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Build-time public envs (set as Build Args in your platform)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM --platform=linux/amd64 node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 libgcc-s1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
# Honour platform-provided PORT if set
ENV PORT=3000
CMD ["sh", "-c", "npm run start -- -p ${PORT}"]
