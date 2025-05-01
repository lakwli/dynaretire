# NumberWalk

A dynamic retirement planning application that helps users plan and manage their retirement strategy.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Production Setup](#production-setup)
  - [Development Setup](#development-setup)
- [Running the Application](#running-the-application)
  - [Local Development](#local-development)
  - [Using Docker](#using-docker)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Logging System](#logging-system)
- [Production Deployment](#production-deployment)
- [Development](#development)

## Features

- **Expense Planning**
  - Ongoing financial commitments tracking
  - Healthcare costs projection with age-adjusted inflation
  - Irregular and one-time expense planning
  - Dynamic expense management across different life stages

- **Retirement Fund Management**
  - Exit-age/retirement fund projection
  - Multiple funding sources with customizable allocation
  - Strategic retirement planning with adaptive models

- **Investment Strategy**
  - Expected returns modeling and historical back-testing
  - Spending control during market downturns
  - Age-based asset allocation adjustment
  - Portfolio rebalancing options

- **Income Planning**
  - Post-exit income projection (rentals, part-time work)
  - FIRE transition strategy for early retirement
  - Pension fund withdrawal handling

- **Interactive Experience**
  - Web-based interface with responsive design
  - Privacy-focused with local data storage
  - Comprehensive visualization of financial scenarios

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd numberwalk

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

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

Build and run using Docker Compose:
```bash
docker-compose up --build
```

## Project Structure

```
numberwalk/
├── app.py                # Main application entry point
├── core/                 # Core business logic
│   ├── account.py        # Account management functionality
│   ├── expenses.py       # Expense tracking and management
│   ├── invest.py         # Investment strategies and calculations
│   └── plan.py           # Retirement planning logic
├── classes/              # Helper classes and utilities
│   └── logging_config.py # Logging configuration
├── static/               # Frontend assets
│   ├── css/              # Compiled CSS files
│   ├── js/               # JavaScript files
│   └── images/           # Image assets
├── templates/            # HTML templates
├── logs/                 # Application logs (auto-generated)
└── docker-compose.yml    # Docker configuration
```

## Configuration

- Environment variables can be set in `.env` file
- Application settings can be modified in the respective configuration files

## Logging System

The application uses a structured logging system with JSON format for easy parsing.

### Log Types and Rotation

| Log File    | Content                  | Rotation Policy       | Retention    |
|-------------|--------------------------|----------------------|--------------|
| app.log     | General application logs | Daily                | 30 days      |
| error.log   | Error-specific logs      | Size-based (100MB)   | 10 backups   |
| access.log  | Access logs              | Daily                | 30 days      |

### Usage Example

```python
from classes.logging_config import initialize_logger

logger = initialize_logger()
logger.info("User action completed")
logger.error("Error occurred", exc_info=True)  # Include stack trace
```

## Production Deployment

The application can be deployed using Docker with our deployment script:

```bash
# Required: Set GitHub credentials
export DOCKER_USER=your_github_username
export DOCKER_TOKEN=your_github_token

# Optional: Configure deployment
export DOCKER_PORT=5001       # Default: 5000
export DEPLOY_NAME=myretireapp  # Default: numberwalk

# Run deployment
./deploy_script.sh
```

### Viewing Logs in Production

```bash
docker exec <container-name> tail -f logs/app.log
```

## Development

The application uses:
- Python for backend logic
- Flask web framework
- JavaScript for frontend interactivity
- Bulma CSS framework for styling
- SCSS (Sassy CSS) for style preprocessing

### What is SCSS?

SCSS (Sassy CSS) is a CSS preprocessor that extends CSS with features like:
- Variables for reusable values
- Nesting for clearer hierarchical selectors
- Mixins for reusable style blocks
- Functions and calculations
- Inheritance between style rules

These features help maintain cleaner, more manageable stylesheets that compile to standard CSS.

### Development Workflow

1. Make code changes
2. Update styles with `npm run sass` if modifying SCSS
3. Test locally with `python app.py`
4. Build with Docker to verify production setup

### Development in Container

For a consistent development environment, this project includes a preconfigured Dev Container setup (`.devcontainer`):

- **Benefits:**
  - Consistent development environment for all contributors
  - All dependencies pre-installed (Git, Node.js, npm, eslint, Python, pip)
  - No need to install development dependencies on your local machine
  
- **Requirements:**
  - [VS Code](https://code.visualstudio.com/)
  - [Docker](https://www.docker.com/products/docker-desktop)
  - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

- **Getting Started:**
  1. Open VS Code
  2. Open the Command Palette (`F1` or `Ctrl+Shift+P`)
  3. Select "Dev Containers: Open Folder in Container..."
  4. Navigate to the cloned NumberWalk repository
  5. VS Code will build and start the container, then open the project

The Dev Container includes all necessary tools for development:
- Git for version control
- Node.js, npm, and eslint for frontend development
- Python3 and pip3 with language extensions for backend development

### Online Version

NumberWalk is available online at [https://numberwalk.com](https://numberwalk.com)
