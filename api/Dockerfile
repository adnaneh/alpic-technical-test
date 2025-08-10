FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
