from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from .content import Content

@dataclass
class Article(Content):
    """
    Represents a static article with all its attributes.
    
    Attributes:
        path: Path to the article (e.g., 'getting-started' or 'docs/installation')
        type: Always 'article' to distinguish from blog posts
        updated_at: Last update timestamp
        image: Optional main image URL for the article
    """
    path: str
    type: str  # Always 'article'
    updated_at: datetime
    image: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert the article to a dictionary."""
        return {
            'path': self.path,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'type': self.type,
            'updated_at': self.updated_at,
            'keywords': self.keywords,
            'image': self.image
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Article':
        """Create an Article instance from a dictionary."""
        # Handle date conversion if it's a string
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        return cls(**data)

    @classmethod
    def from_markdown(cls, path: str, frontmatter: dict, content: str) -> 'Article':
        """Create an Article instance from markdown frontmatter and content."""
        return cls(
            path=path,
            title=frontmatter['title'],
            description=frontmatter.get('description', ''),
            content=content,
            type='article',
            updated_at=datetime.fromisoformat(frontmatter['updated_at']),
            image=frontmatter.get('image')
        )