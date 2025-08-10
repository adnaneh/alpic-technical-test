FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev=false

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
