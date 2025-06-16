FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

RUN echo "window.FIREBASE_CONFIG = { \
    apiKey: \"__FIREBASE_API_KEY__\", \
    authDomain: \"__FIREBASE_AUTH_DOMAIN__\", \
    projectId: \"__FIREBASE_PROJECT_ID__\", \
    storageBucket: \"__FIREBASE_STORAGE_BUCKET__\", \
    messagingSenderId: \"__FIREBASE_MESSAGING_SENDER_ID__\", \
    appId: \"__FIREBASE_APP_ID__\", \
    measurementId: \"__FIREBASE_MEASUREMENT_ID__\" \
    };" > /app/dist/config.js


FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
