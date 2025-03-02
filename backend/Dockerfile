# Stage 1: Build
FROM node:20 AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install  # เปลี่ยนจาก npm install เป็น yarn install
COPY . .
RUN yarn build    # เปลี่ยนจาก npm run build เป็น yarn build

# Stage 2: Production
FROM node:20 AS production
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --production  # เปลี่ยนจาก npm install --only=production เป็น yarn install --production
COPY --from=builder /usr/src/app/dist ./dist
RUN chown -R node:node /usr/src/app
USER node
EXPOSE 3000
CMD ["node", "dist/main"]