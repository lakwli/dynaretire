import os
import logging
import logging.handlers
import json
from datetime import datetime
from pathlib import Path

class LoggerManager:
    """Manages application logging configuration and formatting"""
    
    @staticmethod
    def format_log_entry(record):
        """Creates a structured log entry with all necessary information"""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'worker_id': os.environ.get('GUNICORN_WORKER_ID', '0'),
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'exception': record.exc_info and LoggerManager.format_exception(record.exc_info)
        }

    @staticmethod
    def format_exception(exc_info):
        """Formats exception information for logging"""
        if not exc_info:
            return None
        return logging.Formatter().formatException(exc_info)

    @classmethod
    def setup(cls):
        """Sets up the application logger with all necessary handlers"""
        # Keep logs directly in the project root
        log_dir = Path("logs")
        archive_dir = log_dir / "archived"
        log_dir.mkdir(parents=True, exist_ok=True)
        archive_dir.mkdir(parents=True, exist_ok=True)
        
        # Create root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        
        # Remove any existing handlers
        root_logger.handlers.clear()

        # Add handlers for different log types
        handlers = {
            'app': cls._create_daily_handler(log_dir / "app.log", logging.INFO),
            'error': cls._create_size_handler(log_dir / "error.log", logging.ERROR),
            'access': cls._create_daily_handler(log_dir / "access.log", logging.INFO)
        }
        
        for handler in handlers.values():
            root_logger.addHandler(handler)

        # Log initial setup message
        root_logger.info(f"Logging initialized in {log_dir}")
        return root_logger

    @classmethod
    def _create_daily_handler(cls, filename, level):
        """Creates a daily rotating log handler"""
        handler = logging.handlers.TimedRotatingFileHandler(
            filename=filename,
            when="midnight",
            interval=1,
            backupCount=30,
            encoding="utf-8"
        )
        return cls._configure_handler(handler, level)

    @classmethod
    def _create_size_handler(cls, filename, level):
        """Creates a size-based rotating log handler"""
        handler = logging.handlers.RotatingFileHandler(
            filename=filename,
            maxBytes=100*1024*1024,  # 100MB
            backupCount=10,
            encoding="utf-8"
        )
        return cls._configure_handler(handler, level)

    class JsonFormatter(logging.Formatter):
        """Custom formatter to output logs in JSON format"""
        def format(self, record):
            return json.dumps(LoggerManager.format_log_entry(record))

    @classmethod
    def _configure_handler(cls, handler, level):
        """Configures a log handler with common settings"""
        handler.setLevel(level)
        handler.setFormatter(cls.JsonFormatter())
        return handler

# Create logger instance
def initialize_logger():
    """Initialize and return the application logger"""
    return LoggerManager.setup()
