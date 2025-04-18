import os
from datetime import datetime
from typing import List, Optional, Dict, Set
from pathlib import Path
import json
from bs4 import BeautifulSoup

from .blog_repo import BlogRepository
from ..models.blog import Blog, BlogStatus
from ..config import BlogConfig

class BlogHtmlRepository(BlogRepository):
    """
    File-based implementation of the BlogRepository interface using HTML files.
    Blog posts are stored as individual .html files with metadata in JSON format.
    Uses singleton pattern and class-level caching for optimal performance with Gunicorn workers.
    """
    _instance = None    # Class-level singleton instance
    _posts = []         # Class-level list of all posts
    _featured_posts = [] # Class-level list of featured posts, ordered by date
    _is_loaded = False  # Class-level loading flag

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
            
            # Set default status to published for backward compatibility
            if 'status' not in metadata:
                metadata['status'] = 'published'
            
            # Extract main content
            content_div = soup.find('div', {'class': 'post-content'})
            if not content_div:
                raise ValueError("No content div found in HTML file")

            # Extract canonical URL from meta tag
            canonical_tag = soup.find('meta', {'name': 'canonical-url'})
            canonical_path = canonical_tag['content'] if canonical_tag and 'content' in canonical_tag.attrs else None
            
            # Get post ID from filename (NNN-slug.html -> NNN)
            post_id = file_path.stem.split('-', 1)[0]
            
            # Convert date string to datetime if needed
            date = metadata.get('date')
            if isinstance(date, str):
                # Handle 'Z' timezone designator for older Python versions
                if date.endswith('Z'):
                    date = date[:-1] + '+00:00'
                date = datetime.fromisoformat(date)
            
            # If no url_slug provided, use slugified title
            url_slug = metadata.get('url_slug')
            if not url_slug and metadata.get('title'):
                url_slug = self._slugify(metadata.get('title'))
                
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
                custom_styles=metadata.get('custom_styles'),
                status=metadata.get('status', 'published'),
                url_slug=url_slug,
                canonical_path=canonical_path # Add the extracted canonical path
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
            'custom_styles': post.custom_styles,
            'status': post.status.value,
            'url_slug': post.url_slug
            # Note: canonical_path is not stored in JSON metadata, but directly in HTML meta tag
        }

        canonical_meta_tag = f'<meta name="canonical-url" content="{post.canonical_path}">' if post.canonical_path else ''
        
        html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    {canonical_meta_tag}
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
        featured_posts = []
        for file_path in self.posts_dir.glob('*.html'):
            if post := self._parse_html_file(file_path):
                posts.append(post)
                if post.is_featured:
                    featured_posts.append(post)
        
        # Sort all posts and featured posts by date (newest first)
        self.__class__._posts = sorted(posts, key=lambda x: x.date, reverse=True)
        self.__class__._featured_posts = sorted(featured_posts, key=lambda x: x.date, reverse=True)

    def get_all(self, include_drafts: bool = False, include_staging: bool = False) -> List[Blog]:
        """
        Get blog posts from cache.
        
        Args:
            include_drafts: Whether to include draft posts
            include_staging: Whether to include staging posts
            
        Returns:
            List of blog posts filtered by status
        """
        statuses = {BlogStatus.PUBLISHED}
        if include_drafts:
            statuses.add(BlogStatus.DRAFT)
        if include_staging:
            statuses.add(BlogStatus.STAGING)
        return [post for post in self._posts if post.status in statuses]

    def get_by_id(self, post_id: str) -> Optional[Blog]:
        """
        Get a single blog post by URL slug or ID from cache.
        Args:
            post_id: The URL slug or ID to look up
        Returns:
            The blog post if found and published, None otherwise
        """
        # First try to find by url_slug
        post = next((post for post in self._posts 
                    if post.url_slug == post_id), None)
        
        # If not found by url_slug and the post_id looks like a numeric ID, try finding by ID
        if not post and post_id.isdigit():
            post = next((post for post in self._posts if post.id == post_id), None)
            
        # If post exists and is published, return it
        if post and post.status == BlogStatus.PUBLISHED:
            return post
        return None

    def get_featured(self, limit: int = 1) -> List[Blog]:
        """
        Get the N most recent featured published blog posts from cache.
        Args:
            limit: Number of featured posts to return (default: 1)
        Returns:
            List of the N most recent featured published posts
        """
        published_featured = [post for post in self._featured_posts 
                            if post.status == BlogStatus.PUBLISHED]
        return published_featured[:limit]

    def get_regular_posts(self, featured_limit: int = 1) -> List[Blog]:
        """
        Get regular published posts and any featured published posts that didn't make it into the featured section.
        Args:
            featured_limit: Number of featured posts being displayed in featured section (default: 1)
        Returns:
            List of regular posts and overflow featured posts
        """
        published_featured = [post for post in self._featured_posts 
                            if post.status == BlogStatus.PUBLISHED]
        featured_set = set(post.id for post in published_featured[:featured_limit])
        return [post for post in self._posts 
                if post.status == BlogStatus.PUBLISHED 
                and not (post.is_featured and post.id in featured_set)]

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
