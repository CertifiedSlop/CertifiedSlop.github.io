FROM docker.io/library/node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# Install serve for static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the static server
CMD ["serve", "-s", "out", "-l", "3000"]
