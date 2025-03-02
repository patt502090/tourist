FROM node:20 AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20 AS production
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist
RUN chown -R node:node /usr/src/app
USER node
EXPOSE 3000
CMD ["node", "dist/main"]