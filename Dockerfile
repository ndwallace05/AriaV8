# Stage 1: Build the React frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup the Python backend
FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Expose ports
EXPOSE 80    # For the frontend http server
EXPOSE 5001  # For the token server
# Note: The agent itself communicates via WebRTC, which uses a range of UDP ports.
# These are typically handled by the LiveKit server infrastructure.

# Run the startup script
CMD ["./start.sh"]
