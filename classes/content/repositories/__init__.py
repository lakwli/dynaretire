"""
Blog repository implementations.
Provides different storage backends for blog posts.
"""

from .blog_repo import BlogRepository
from .blog_memory import InMemoryBlogRepository

__all__ = [
    'BlogRepository',
    'InMemoryBlogRepository',
]