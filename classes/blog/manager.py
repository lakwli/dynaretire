from typing import List, Optional, Tuple
from .models.blog_post import BlogPost
from .repositories.base import BlogRepository

class BlogManager:
    """
    Manages blog-related operations and business logic.
    Acts as an interface between the repository and the Flask routes.
    """

    def __init__(self, repository: BlogRepository):
        """Initialize with a blog repository."""
        self._repository = repository

    def get_blog_list(self) -> Tuple[Optional[BlogPost], List[BlogPost]]:
        """
        Get the featured post and regular posts for the blog list page.
        
        Returns:
            A tuple of (featured_post, regular_posts)
        """
        featured = self._repository.get_featured()
        regular_posts = self._repository.get_regular_posts()
        return featured, regular_posts

    def get_article(self, article_id: str) -> Optional[BlogPost]:
        """
        Get a single article by its ID.
        
        Args:
            article_id: The unique identifier of the article
            
        Returns:
            The blog post if found, None otherwise
        """
        return self._repository.get_by_id(article_id)

    def get_all_articles(self) -> List[BlogPost]:
        """
        Get all articles, sorted by date.
        
        Returns:
            List of all blog posts
        """
        return self._repository.get_all()

    # Future methods when we add more features:
    # def create_article(self, article_data: dict) -> BlogPost:
    #     """Create a new article."""
    #     post = BlogPost.from_dict(article_data)
    #     return self._repository.create(post)
    
    # def update_article(self, article_id: str, article_data: dict) -> Optional[BlogPost]:
    #     """Update an existing article."""
    #     current = self._repository.get_by_id(article_id)
    #     if not current:
    #         return None
    #     updated = BlogPost.from_dict({**current.to_dict(), **article_data})
    #     return self._repository.update(updated)
    
    # def delete_article(self, article_id: str) -> bool:
    #     """Delete an article."""
    #     return self._repository.delete(article_id)