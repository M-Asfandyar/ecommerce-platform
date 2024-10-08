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

# Expose the port your service will run on (e.g., 3000)
EXPOSE 3000

# Command to run the Node.js app
CMD ["npm", "start"]
