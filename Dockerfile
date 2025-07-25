# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first for caching efficiency
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies for both root and backend
RUN npm install
RUN cd backend && npm install

# Copy the rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your server
CMD ["node", "backend/server.js"] 