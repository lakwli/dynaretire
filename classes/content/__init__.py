"""
Blog management package for DynaRetire.
Provides a clean interface for managing blog posts and articles.
"""

from .models.blog import Blog
from .models.article import Article
from .repositories.blog_repo import BlogRepository
from .repositories.blog_html import BlogHtmlRepository
from .repositories.article_html import ArticleHtmlRepository
from .manager import ContentManager

# Create singleton instances of repositories
blog_repository = BlogHtmlRepository("content/blog")
article_repository = ArticleHtmlRepository("content/articles")

# Create a singleton instance of the manager with HTML repositories
blog_manager = ContentManager(blog_repository, article_repository)

__all__ = [
    'Blog',
    'Article',
    'BlogRepository',
    'BlogMarkdownRepository',
    'MarkdownArticleRepository',
    'ContentManager',
    'blog_manager',
]