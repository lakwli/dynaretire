from dataclasses import dataclass

@dataclass
class BlogConfig:
    """
    Configuration settings for the blog system.
    
    Attributes:
        last_id: Last used blog post ID (manually incremented for now)
        default_category: Default category for new posts
        image_upload_path: Path for blog image uploads
        max_featured_posts: Maximum number of featured posts allowed
    """
    last_id: int = 2  # Current latest ID after migration
    default_category: str = "General"
    image_upload_path: str = "content/blog/assets/images"
    max_featured_posts: int = 1
