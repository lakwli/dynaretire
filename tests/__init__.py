"""
Test framework for retirement plan scenarios.

This package provides tools to:
1. Load a base retirement plan JSON
2. Apply modifications for different scenarios
3. Generate and save results with timestamps
4. Support flexible output paths and file naming
"""

from .test_base import TestBase
from .test_scenarios import TestScenarios

__all__ = ['TestBase', 'TestScenarios']
