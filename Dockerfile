# Build stage - Use newer Node.js version
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]