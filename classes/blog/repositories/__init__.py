"""
Blog repository implementations.
Provides different storage backends for blog posts.
"""

from .base import BlogRepository
from .memory import InMemoryBlogRepository

__all__ = [
    'BlogRepository',
    'InMemoryBlogRepository',
]