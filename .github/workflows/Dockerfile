# Base image
FROM node:14

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9000

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Run the app
CMD [ "npm", "start" ]
