# Use official Node.js 20 Alpine image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies and serve package globally
RUN npm install && npm install -g serve

# Copy all project files
COPY . .

# Build the frontend React app using Vite
RUN npm run build

# Expose port 3000 for the frontend app
EXPOSE 3000

# Set environment variables (optional, user can override at runtime)
ENV NODE_ENV=production

# Start the frontend app using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
