#!/bin/sh
# This script replaces placeholders in the config.js with actual environment variables

# Set the path to the config file
CONFIG_FILE=/usr/share/nginx/html/config.js

# Replace each placeholder with the value of the corresponding environment variable
sed -i "s|__FIREBASE_API_KEY__|${VITE_FIREBASE_API_KEY}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_AUTH_DOMAIN__|${VITE_FIREBASE_AUTH_DOMAIN}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_PROJECT_ID__|${VITE_FIREBASE_PROJECT_ID}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_STORAGE_BUCKET__|${VITE_FIREBASE_STORAGE_BUCKET}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_MESSAGING_SENDER_ID__|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_APP_ID__|${VITE_FIREBASE_APP_ID}|g" $CONFIG_FILE
sed -i "s|__FIREBASE_MEASUREMENT_ID__|${VITE_FIREBASE_MEASUREMENT_ID}|g" $CONFIG_FILE

# Start the Nginx server in the foreground
nginx -g 'daemon off;'
