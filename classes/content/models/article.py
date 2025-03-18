from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List

@dataclass
class Article:
    """
    Represents a static article with all its attributes.
    
    Attributes:
        path: Path to the article (e.g., 'getting-started' or 'docs/installation')
        title: Main title of the article
        description: Short description or subtitle
        content: Full HTML content of the article
        type: Always 'article' to distinguish from blog posts
        updated_at: Last update timestamp
        keywords: List of keywords for SEO
        image: Optional main image URL for the article
        custom_css_file: Optional path to custom CSS file
        custom_styles: Optional inline CSS styles
    """
    path: str
    title: str
    description: str
    content: str
    type: str  # Always 'article'
    updated_at: datetime
    keywords: List[str] = field(default_factory=list)
    image: Optional[str] = None
    custom_css_file: Optional[str] = None
    custom_styles: Optional[str] = None

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