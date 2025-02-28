# Define build arguments
ARG NODE_ENV="local"
ARG FRONTEND_ORIGIN="http://localhost:3000"
ARG MONGODB_CONNECTION_STRING="mongodb://localhost:27017/leetcode"
ARG JWT_SECRET="7d3f2e1b9c8a5d4f6e3b2a1c9d8e7f6b5a4d3c2b1e9f8d7"
ARG DOMAIN="localhost"

# Stage 1: Development
FROM node:20 AS development

# Use build arguments as environment variables
ENV NODE_ENV=$NODE_ENV
ENV FRONTEND_ORIGIN=$FRONTEND_ORIGIN
ENV MONGODB_CONNECTION_STRING=$MONGODB_CONNECTION_STRING
ENV JWT_SECRET=$JWT_SECRET
ENV DOMAIN=$DOMAIN

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command
RUN npm install

# Bundle app source
COPY --chown=node:node . .

# Build the app
RUN npm run build

# Stage 2: Production
FROM node:20 AS production

ARG NODE_ENV="local"
ARG FRONTEND_ORIGIN=""
ARG MONGODB_CONNECTION_STRING=""
ARG JWT_SECRET=""
ARG DOMAIN=""

# Use build arguments as environment variables
ENV NODE_ENV="production"
ENV FRONTEND_ORIGIN=$FRONTEND_ORIGIN
ENV MONGODB_CONNECTION_STRING=$MONGODB_CONNECTION_STRING
ENV JWT_SECRET=$JWT_SECRET
ENV DOMAIN=$DOMAIN

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY --chown=node:node package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files and node_modules from the development stage
COPY --chown=node:node --from=development /usr/src/app/dist ./dist
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# Copy the rest of the application source code
COPY --chown=node:node . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/main"]