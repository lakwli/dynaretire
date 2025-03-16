from typing import List, Optional, Tuple
from .models.blog import Blog
from .models.article import Article
from .repositories.blog_repo import BlogRepository
from .repositories.article_markdown import ArticleMarkdownRepository

class ContentManager:
    """
    Manages blog and article-related operations and business logic.
    Acts as an interface between the repositories and the Flask routes.
    """

    def __init__(self, blog_repository: BlogRepository, article_repository: ArticleMarkdownRepository):
        """Initialize with blog and article repositories."""
        self._blog_repository = blog_repository
        self._article_repository = article_repository

    def get_blog_list(self) -> Tuple[Optional[Blog], List[Blog]]:
        """
        Get the featured post and regular posts for the blog list page.
        
        Returns:
            A tuple of (featured_post, regular_posts)
        """
        featured = self._blog_repository.get_featured()
        regular_posts = self._blog_repository.get_regular_posts()
        return featured, regular_posts

    def get_article(self, article_id: str) -> Optional[Blog]:
        """
        Get a single blog post by its ID.
        
        Args:
            article_id: The unique identifier of the blog post
            
        Returns:
            The blog post if found, None otherwise
        """
        return self._blog_repository.get_by_id(article_id)

    def get_article_by_path(self, article_path: str) -> Optional[Article]:
        """
        Get a static article by its path.
        
        Args:
            article_path: The path of the article (e.g., 'getting-started' or 'docs/setup')
            
        Returns:
            The article if found, None otherwise
        """
        return self._article_repository.get_by_path(article_path)

    def get_all_articles(self) -> List[Article]:
        """
        Get all static articles.
        
        Returns:
            List of all articles
        """
        return self._article_repository.get_all()

    def get_all_blog_posts(self) -> List[Blog]:
        """
        Get all blog posts.
        
        Returns:
            List of all blog posts
        """
        return self._blog_repository.get_all()

    # Future methods:
    # def create_blog_post(self, post_data: dict) -> BlogPost:
    #     post = BlogPost.from_dict(post_data)
    #     return self._blog_repository.create(post)
    
    # def create_article(self, article_data: dict) -> Article:
    #     article = Article.from_dict(article_data)
    #     return self._article_repository.create(article)