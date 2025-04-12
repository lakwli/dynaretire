"""
Study management for retirement plan configurations.

This package provides tools to:
1. Define and organize study scenarios
2. Generate study variations
3. Handle study metadata and results
"""

from .request.model import StudyScenarios
from .request.generator import StudyGenerator, generate_min_spend_study
from .request.scenarios import TestScenarios

__all__ = [
    'StudyScenarios',
    'StudyGenerator',
    'TestScenarios',
    'generate_min_spend_study'
]
