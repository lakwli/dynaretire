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
- Node.js and npm
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynaretire
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Node.js dependencies:
```bash
npm install
```

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
