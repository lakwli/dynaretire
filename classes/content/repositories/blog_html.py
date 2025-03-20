import os
from datetime import datetime
from typing import List, Optional, Dict
from pathlib import Path
import json
from bs4 import BeautifulSoup

from .blog_repo import BlogRepository
from ..models.blog import Blog
from ..config import BlogConfig

class BlogHtmlRepository(BlogRepository):
    """
    File-based implementation of the BlogRepository interface using HTML files.
    Blog posts are stored as individual .html files with metadata in JSON format.
    Uses singleton pattern and class-level caching for optimal performance with Gunicorn workers.
    """
    _instance = None  # Class-level singleton instance
    _posts = []       # Class-level list of all posts
    _featured_post = None  # Class-level featured post
    _is_loaded = False    # Class-level loading flag

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, content_dir: str = "content/blog"):
        if not self._is_loaded:  # Only load once per process
            self.content_dir = Path(content_dir)
            self.posts_dir = self.content_dir / "posts"
            self._ensure_dirs_exist()
            self.load_posts()
            self.__class__._is_loaded = True

    def _ensure_dirs_exist(self) -> None:
        """Ensure all required directories exist."""
        os.makedirs(self.content_dir, exist_ok=True)
        os.makedirs(self.posts_dir, exist_ok=True)
        os.makedirs(self.content_dir / "assets" / "images", exist_ok=True)

    def _slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug."""
        # Convert to lowercase
        text = text.lower()
        # Replace spaces with hyphens
        text = text.replace(' ', '-')
        # Remove any characters that aren't alphanumeric or hyphens
        text = ''.join(c for c in text if c.isalnum() or c == '-')
        # Remove multiple consecutive hyphens
        while '--' in text:
            text = text.replace('--', '-')
        # Remove leading/trailing hyphens
        text = text.strip('-')
        return text

    def _parse_html_file(self, file_path: Path) -> Optional[Blog]:
        """Parse an HTML file into a Blog object."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract metadata from JSON script tag
            meta_tag = soup.find('script', {'id': 'post-metadata', 'type': 'application/json'})
            if not meta_tag:
                raise ValueError("No metadata found in HTML file")
                
            metadata = json.loads(meta_tag.string)
            
            # Extract main content
            content_div = soup.find('div', {'class': 'post-content'})
            if not content_div:
                raise ValueError("No content div found in HTML file")
            
            # Get post ID from filename (NNN-slug.html -> NNN)
            post_id = file_path.stem.split('-', 1)[0]
            
            # Convert date string to datetime if needed
            date = metadata.get('date')
            if isinstance(date, str):
                # Handle 'Z' timezone designator for older Python versions
                if date.endswith('Z'):
                    date = date[:-1] + '+00:00'
                date = datetime.fromisoformat(date)
            
            return Blog(
                id=post_id,
                title=metadata.get('title', ''),
                description=metadata.get('description', ''),
                content=str(content_div),
                category=metadata.get('category', ''),
                date=date,
                read_time=metadata.get('read_time', ''),
                keywords=metadata.get('keywords', []),
                image=metadata.get('image', ''),
                card_image=metadata.get('card_image'),
                is_featured=metadata.get('is_featured', False),
                custom_css_file=metadata.get('custom_css_file'),
                custom_styles=metadata.get('custom_styles')
            )
        except Exception as e:
            print(f"Error parsing HTML file {file_path}: {e}")
            return None

    def _create_html_content(self, post: Blog) -> str:
        """Create HTML content from blog post."""
        metadata = {
            'title': post.title,
            'description': post.description,
            'category': post.category,
            'date': post.date.isoformat(),
            'read_time': post.read_time,
            'keywords': post.keywords,
            'image': post.image,
            'card_image': post.card_image,
            'is_featured': post.is_featured,
            'custom_css_file': post.custom_css_file,
            'custom_styles': post.custom_styles
        }
        
        html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post.title}</title>
    <script id="post-metadata" type="application/json">
    {json.dumps(metadata, indent=2)}
    </script>
</head>
<body>
    <article>
        <div class="post-content">
            {post.content}
        </div>
    </article>
</body>
</html>'''
        
        return html_template

    def load_posts(self):
        """Load all posts into class-level cache"""
        posts = []
        for file_path in self.posts_dir.glob('*.html'):
            if post := self._parse_html_file(file_path):
                posts.append(post)
                if post.is_featured:
                    self.__class__._featured_post = post
        
        self.__class__._posts = sorted(posts, key=lambda x: x.date, reverse=True)

    def get_all(self) -> List[Blog]:
        """Get all blog posts from cache."""
        return self._posts

    def get_by_id(self, post_id: str) -> Optional[Blog]:
        """Get a single blog post by ID from cache."""
        return next((post for post in self._posts if post.id == post_id), None)

    def get_featured(self) -> Optional[Blog]:
        """Get the featured blog post from cache."""
        return self._featured_post

    def get_regular_posts(self) -> List[Blog]:
        """Get all non-featured blog posts from cache."""
        return [post for post in self._posts if not post.is_featured]

    def create(self, post: Blog) -> Blog:
        """Create a new blog post and reload cache."""
        # Format filename using numeric ID
        filename = f"{post.id}-{self._slugify(post.title)}.html"
        file_path = self.posts_dir / filename

        # Generate HTML content
        html_content = self._create_html_content(post)

        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Reload all posts to update class-level cache
        self.load_posts()
        return post

    def update(self, post: Blog) -> Blog:
        """Update an existing blog post."""
        return self.create(post)  # Same operation as create

    def delete(self, post_id: str) -> bool:
        """Delete a blog post and reload cache."""
        success = False
        for file_path in self.posts_dir.glob('*-' + post_id + '.html'):
            try:
                file_path.unlink()
                success = True
                if success:
                    self.load_posts()  # Reload cache after successful deletion
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")
        return success
