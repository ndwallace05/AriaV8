#!/bin/bash

# Start the Python token server in the background
echo "Starting token server..."
python token_server.py &

# Start the Python agent in the background
echo "Starting agent..."
python agent.py &

# Start a simple web server for the frontend files
echo "Starting frontend server..."
python -m http.server 80 -d dist

# Wait for all background processes to finish
wait
