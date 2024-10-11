# Use the official Node.js image for version 20
FROM node:20.12.2

# Create and set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# The port service is running on 
EXPOSE 3002

# Command to run the Node.js app
CMD ["npm", "start"]
