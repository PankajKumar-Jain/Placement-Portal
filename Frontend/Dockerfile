# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define the command to run your app
CMD ["npm", "run", "dev"]

# Expose the port your app runs on
EXPOSE 5173
