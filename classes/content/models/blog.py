from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from .content import Content

@dataclass
class Blog(Content):
    """
    Represents a blog post with all its attributes.
    
    Attributes:
        id: Unique identifier for the blog post
        category: Category of the blog post
        date: Publication date
        read_time: Estimated reading time
        image: Main image URL for the blog post
        card_image: Optional image URL for card preview
        is_featured: Whether this is a featured post
    """
    id: str
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
            'keywords': self.keywords,
            'image': self.image,
            'card_image': self.card_image or self.image,
            'is_featured': self.is_featured,
            'custom_css_file': self.custom_css_file,
            'custom_styles': self.custom_styles
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Blog':
        """Create a BlogPost instance from a dictionary."""
        # Handle date conversion if it's a string
        if isinstance(data.get('date'), str):
            data['date'] = datetime.fromisoformat(data['date'])
        return cls(**data)