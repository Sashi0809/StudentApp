# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install Node.js and required C libraries for Python (like libgomp1 for scikit-learn)
RUN apt-get update && apt-get install -y curl libgomp1 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY ml/requirements.txt ./ml/
RUN pip install --no-cache-dir -r ml/requirements.txt

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the app
CMD ["npm", "start"]
