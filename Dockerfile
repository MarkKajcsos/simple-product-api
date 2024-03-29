# Use the official Node.js image as base
FROM node:21-bookworm

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Build the Node.js app - Enable if you run 'npm run start'
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set user
USER node

# Command to run the app
CMD [ "npm", "run", "dev" ]