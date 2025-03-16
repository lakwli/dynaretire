from abc import ABC, abstractmethod
from typing import List, Optional
from ..models.blog import Blog

class BlogRepository(ABC):
    """
    Abstract base class defining the interface for blog post repositories.
    This ensures consistent access patterns regardless of the storage backend.
    """

    @abstractmethod
    def get_all(self) -> List[Blog]:
        """Get all blog posts."""
        pass

    @abstractmethod
    def get_by_id(self, post_id: str) -> Optional[Blog]:
        """Get a single blog post by ID."""
        pass

    @abstractmethod
    def get_featured(self) -> Optional[Blog]:
        """Get the featured blog post."""
        pass

    @abstractmethod
    def get_regular_posts(self) -> List[Blog]:
        """Get all non-featured blog posts."""
        pass

    # Future methods for when we add database support:
    # @abstractmethod
    # def create(self, post: BlogPost) -> BlogPost:
    #     """Create a new blog post."""
    #     pass
    
    # @abstractmethod
    # def update(self, post: BlogPost) -> BlogPost:
    #     """Update an existing blog post."""
    #     pass
    
    # @abstractmethod
    # def delete(self, post_id: str) -> bool:
    #     """Delete a blog post."""
    #     pass