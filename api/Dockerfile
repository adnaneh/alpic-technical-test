FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN NODE_OPTIONS="--max-old-space-size=512" npm install --legacy-peer-deps --verbose

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

RUN npm prune --production --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "run", "start:prod"]