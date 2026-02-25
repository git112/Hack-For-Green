# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables (should be provided by deployment platform)
# ENV MONGODB_URI=...
# ENV GEMINI_API_KEY=...
# ENV JWT_SECRET=...

CMD ["npm", "start"]
