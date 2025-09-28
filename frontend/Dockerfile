# Frontend multi-stage build: build with Node, serve with Nginx

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Serve stage
FROM nginx:1.25-alpine
# Copy custom nginx config (handles /api proxy to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
