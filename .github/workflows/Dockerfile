# Dockerfile for running a swagger API in GitHub Actions


# Base image
FROM node:14

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE $PORT

# Run the app
CMD [ "npm", "start" ]