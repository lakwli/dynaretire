# DynaRetire

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
cd dynaretire
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
dynaretire/
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

## Configuration

- Environment variables can be set in `.env` file
- Application settings can be modified in the respective configuration files

## Development

The application uses:
- Python for backend logic
- Flask web framework
- JavaScript for frontend interactivity
- Bulma CSS framework for styling
