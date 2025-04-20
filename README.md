# NumberWalk

A dynamic retirement planning application that helps users plan and manage their retirement strategy.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Expense tracking and management
- Investment fund management
- Income planning
- Strategic retirement planning
- Interactive web interface

## Prerequisites

- Python 3.x
- Node.js and npm (development only)
- Docker (optional)

Note: Node.js is only required during development for compiling SCSS files. The compiled CSS files are committed to the repository, so end users don't need Node.js to run the application.

## Installation

### Production Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd numberwalk
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Development Setup

If you need to modify SCSS files or work on the frontend:

1. Install Node.js dependencies (clean install recommended):
```bash
npm ci
```

2. Compile SCSS files (when making style changes):
```bash
npm run sass
```

3. Clean up cache files when needed:
```bash
npm run clean
```

Note: We use `npm ci` instead of `npm install` for a cleaner, more reproducible installation. This ensures exact versions from package-lock.json are used and removes old/redundant files.

## Running the Application

### Local Development

Start the Python web server:
```bash
python app.py
```

### Using Docker

1. Build and run using Docker Compose:
```bash
docker-compose up --build
```

## Project Structure

```
numberwalk/
├── app.py                 # Main application entry point
├── core/                  # Core business logic
│   ├── account.py
│   ├── expenses.py
│   ├── invest.py
│   └── plan.py
├── classes/              # Helper classes and utilities
├── static/              # Frontend assets
│   ├── css/
│   ├── js/
│   └── images/
├── templates/           # HTML templates
└── docker-compose.yml  # Docker configuration
```

## Logging System

The application uses a structured logging system that works in both development and production environments.

### Log Structure

```
Development:
numberwalk/
  └── logs/
      ├── app.log      # General application logs (daily rotation)
      ├── error.log    # Error-specific logs (size-based rotation)
      ├── access.log   # Access logs (daily rotation)
      └── archived/    # Archived logs
```

### Log Format

Logs are stored in JSON format for easy parsing:
```json
{
    "timestamp": "2025-04-02T11:58:37.123456",
    "level": "INFO",
    "worker_id": "0",
    "message": "Action completed",
    "module": "app",
    "function": "home",
    "line": 123,
    "exception": null
}
```

### Log Management

- **Rotation**:
  - app.log: Daily rotation, 30-day retention
  - error.log: 100MB size limit, 10 backups
  - access.log: Daily rotation, 30-day retention
- **Archive**: Rotated logs are compressed and stored in the archived directory
- **Cleanup**: Logs older than 30 days are automatically removed

### Usage in Code

```python
from classes.logging_config import initialize_logger

logger = initialize_logger()

# Log levels
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message", exc_info=True)  # Include stack trace
```

### Production Deployment

The deployment script (`deploy_script.sh`) handles container deployment and log management:

1. **First-time Setup**:
```bash
# Required: GitHub credentials for accessing the container image
export DOCKER_USER=your_github_username
export DOCKER_TOKEN=your_github_token
```

2. **Optional Configuration**:
```bash
# Choose port number (default: 5000)
export DOCKER_PORT=5001           # App will be available at localhost:5001

# Choose container name (default: numberwalk)
export DEPLOY_NAME=myretireapp    # Container and log volume will use this name
```

3. **Deployment**:
```bash
./deploy_script.sh
```

4. **Viewing Logs**:
```bash
# If using default container name
docker exec numberwalk tail -f logs/app.log     # Application logs
docker exec numberwalk tail -f logs/error.log   # Error logs

# If using custom container name
docker exec myretireapp tail -f logs/app.log    # Replace with your DEPLOY_NAME
```

The script will:
- Pull the official image (`ghcr.io/lakwli/numberwalk:latest`)
- Create a dedicated log volume named `{DEPLOY_NAME}_logs`
- Run container with your chosen name and port
- Configure automatic log rotation and cleanup

### Security Notes

- Log files are automatically added to .gitignore
- No sensitive information in logs (automatically sanitized)
- Deployment credentials are managed via environment variables
- Log directory permissions are properly set

## Configuration

- Environment variables can be set in `.env` file
- Application settings can be modified in the respective configuration files

## Development

The application uses:
- Python for backend logic
- Flask web framework
- JavaScript for frontend interactivity
- Bulma CSS framework for styling
