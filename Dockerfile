# ===============================
# Stage 1: Build the Application
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Define build arguments for Environment Variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Changed from 'npm ci' to 'npm install' to fix the lockfile sync error
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===============================
# Stage 2: Serve with Nginx
# ===============================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from Stage 1 to Nginx html directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]