FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /e2e

# Install socat for port forwarding (essential for React apps hardcoded to localhost)
RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy test source
COPY . .

# The entrypoint is defined in package.json "test:docker" script
# We start socat in the background, then run tests
CMD ["npm", "run", "test:docker"]