"""
Blog management package for DynaRetire.
Provides a clean interface for managing blog posts and articles.
"""

from .models.blog_post import BlogPost
from .repositories.base import BlogRepository
from .repositories.memory import InMemoryBlogRepository
from .manager import BlogManager

# Create a singleton instance of the blog manager with in-memory repository
blog_manager = BlogManager(InMemoryBlogRepository())

__all__ = [
    'BlogPost',
    'BlogRepository',
    'InMemoryBlogRepository',
    'BlogManager',
    'blog_manager',
]