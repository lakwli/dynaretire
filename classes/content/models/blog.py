from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Blog:
    """
    Represents a blog post with all its attributes.
    
    Attributes:
        id: Unique identifier for the blog post
        title: Main title of the blog post
        description: Short description or subtitle
        content: Full HTML content of the blog post
        category: Category of the blog post
        date: Publication date
        read_time: Estimated reading time
        image: Main image URL for the blog post
        card_image: Optional image URL for card preview
        is_featured: Whether this is a featured post
    """
    id: str
    title: str
    description: str
    content: str
    category: str
    date: datetime
    read_time: str
    image: str
    card_image: Optional[str] = None
    is_featured: bool = False

    def to_dict(self) -> dict:
        """Convert the blog post to a dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'category': self.category,
            'date': self.date,
            'read_time': self.read_time,
            'image': self.image,
            'card_image': self.card_image or self.image,
            'is_featured': self.is_featured
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Blog':
        """Create a BlogPost instance from a dictionary."""
        # Handle date conversion if it's a string
        if isinstance(data.get('date'), str):
            data['date'] = datetime.fromisoformat(data['date'])
        return cls(**data)