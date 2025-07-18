# Use official Node.js 18 Alpine image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the frontend React app using Vite
RUN npm run build

# Expose port 5000 for the backend server
EXPOSE 5000

# Set environment variables (optional, user can override at runtime)
ENV NODE_ENV=production

# Start the backend server
CMD ["node", "server/server.js"]
