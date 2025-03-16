from datetime import datetime
from typing import List, Optional
from .blog_repo import BlogRepository
from ..models.blog import Blog

class InMemoryBlogRepository(BlogRepository):
    """
    In-memory implementation of the BlogRepository interface.
    Uses hardcoded data for development and testing.
    """

    def __init__(self):
        # Initialize with hardcoded blog posts
        self._posts = [
            Blog(
                id="early-retirement-myths",
                title="Common Myths About Early Retirement",
                description="Debunking misconceptions about retiring before the traditional age of 65",
                content='''
                    <h2>Understanding Early Retirement Reality</h2>
                    
                    <p>Many people believe that early retirement is only possible for the wealthy elite or requires extreme frugality. However, the reality is much different. With proper planning, strategic investing, and smart lifestyle choices, early retirement can be achievable for many individuals. The key lies in understanding your expenses, building multiple income streams, and making informed decisions about your investments. Using tools like DynaRetire can help you visualize and plan your path to early retirement while maintaining a comfortable lifestyle.</p>
                ''',
                category="Early Retirement",
                date=datetime(2025, 3, 16),
                read_time="2 min read",
                image="/static/images/WithdrawAge.png",
                card_image="/static/images/Savings.png",
                is_featured=True
            ),
            # You can add more blog posts here as needed
        ]

    def get_all(self) -> List[Blog]:
        """Get all blog posts."""
        return sorted(self._posts, key=lambda x: x.date, reverse=True)

    def get_by_id(self, post_id: str) -> Optional[Blog]:
        """Get a single blog post by ID."""
        return next((post for post in self._posts if post.id == post_id), None)

    def get_featured(self) -> Optional[Blog]:
        """Get the featured blog post."""
        return next((post for post in self._posts if post.is_featured), None)

    def get_regular_posts(self) -> List[Blog]:
        """Get all non-featured blog posts."""
        return sorted(
            [post for post in self._posts if not post.is_featured],
            key=lambda x: x.date,
            reverse=True
        )

    # Future methods for database support would be implemented here
    # def create(self, post: BlogPost) -> BlogPost:
    #     self._posts.append(post)
    #     return post
    
    # def update(self, post: BlogPost) -> BlogPost:
    #     self._posts = [p if p.id != post.id else post for p in self._posts]
    #     return post
    
    # def delete(self, post_id: str) -> bool:
    #     initial_length = len(self._posts)
    #     self._posts = [p for p in self._posts if p.id != post_id]
    #     return len(self._posts) < initial_length