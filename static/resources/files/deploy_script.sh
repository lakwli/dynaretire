#!/bin/bash

#######################################
# DynaRetire Deployment Script
#######################################
# STEP 1: Set these environment variables if needed!
#
# Optional (shown with defaults):
#   export DOCKER_PORT=5000       # App will be at localhost:5000
#   export DEPLOY_NAME=numberwalk # Container name (affects log directory)
#   export LOG_DIR=/var/log      # Where to store logs on your host machine
#
# Example deployment:
#   export DOCKER_PORT=8080
#   export DEPLOY_NAME=myapp
#   export LOG_DIR=/opt/logs
#   
#   ./deploy_script.sh
#
# This will:
# 1. Deploy container named 'myapp'
# 2. Make app available at http://localhost:8080
# 3. Write logs to your host machine at /opt/logs/myapp/
#    - You can read these logs directly with: tail -f /opt/logs/myapp/app.log
#    - No need to enter the container to view logs
#######################################

# Settings
IMAGE_NAME="ghcr.io/lakwli/dynaretire:latest"   # Fixed image path
CONTAINER_NAME="${DEPLOY_NAME:-numberwalk}"      # Container name
PORT="${DOCKER_PORT:-5000}"                      # Host port mapping
LOG_ROOT="${LOG_DIR:-/var/log}"                 # Parent log directory
HOST_LOGS="${LOG_ROOT}/${CONTAINER_NAME}"       # Container-specific logs

# Create logs directory with proper permissions
echo "Setting up logs directory at: $HOST_LOGS"
if [ -w "$LOG_ROOT" ]; then
    mkdir -p $HOST_LOGS
    chmod 777 $HOST_LOGS
else
    echo "Creating logs directory with sudo..."
    sudo mkdir -p $HOST_LOGS
    sudo chmod 777 $HOST_LOGS
fi

# Clean up old container
echo "Cleaning up old container..."
docker rm -f $CONTAINER_NAME || true
docker rmi -f $IMAGE_NAME || true

# Pull latest image
echo "Pulling the latest image..."
docker pull $IMAGE_NAME

if [ $? -ne 0 ]; then
  echo "Failed to pull Docker image. Exiting."
  exit 1
fi

# Start container with project-specific log volume
echo "Starting container '$CONTAINER_NAME' using image $IMAGE_NAME..."
docker run -d \
  --name $CONTAINER_NAME \
  -p "${PORT}:5000" \
  -v "${HOST_LOGS}:/app/logs" \
  $IMAGE_NAME

if [ $? -eq 0 ]; then
  echo "Container $CONTAINER_NAME started successfully!"
  echo ""
  echo "Your logs are directly accessible on the host machine at:"
  echo "  $HOST_LOGS/"
  echo ""
  echo "You can view them with regular commands (no need to use docker):"
  echo "  tail -f $HOST_LOGS/app.log    # View live application logs"
  echo "  less $HOST_LOGS/error.log     # Browse error logs"
  echo "  grep 'ERROR' $HOST_LOGS/*.log # Search for errors in all logs"
  echo ""
  echo "Note: The logs are stored on your host machine, not just in the container."
  echo "      You can use any standard tools to read, search, and analyze them."
else
  echo "Failed to start container. Exiting."
  exit 1
fi
