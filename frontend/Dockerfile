FROM node:20 AS build

ARG VITE_API_BASE_URL="http://localhost:8080/"
ARG VITE_JUDGEAPI_BASE_URL="https://judge0-ce.p.rapidapi.com"
ARG VITE_JUDGEAPI_API_KEY="129f8f9029msha41a8399612ae9cp10c969jsn2a453b0b7d0d"
ARG VITE_JUDGEAPI_HOST="judge0-ce.p.rapidapi.com"
ARG VITE_GUEST_USER_PASSWORD="GuestGuestGuest"
ARG VITE_GUEST_USER_EMAIL="Guest@Guest.com"

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_JUDGEAPI_BASE_URL=$VITE_JUDGEAPI_BASE_URL \
    VITE_JUDGEAPI_API_KEY=$VITE_JUDGEAPI_API_KEY \
    VITE_JUDGEAPI_HOST=$VITE_JUDGEAPI_HOST \
    VITE_GUEST_USER_PASSWORD=$VITE_GUEST_USER_PASSWORD \
    VITE_GUEST_USER_EMAIL=$VITE_GUEST_USER_EMAIL \
    yarn run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine
ARG DEPLOYMENT_ENV="local"
ENV DEPLOYMENT_ENV=$DEPLOYMENT_ENV
COPY --from=build /app/dist /usr/share/nginx/html
COPY /nginx/nginx.${DEPLOYMENT_ENV}.conf /etc/nginx/templates/nginx.conf.template

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]