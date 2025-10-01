# Use official Node.js LTS image (Alpine for small size)
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the port your server will run on (adjust if needed)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
