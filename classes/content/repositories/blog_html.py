import os
from datetime import datetime
from typing import List, Optional, Dict
from pathlib import Path
import json
from bs4 import BeautifulSoup

from .blog_repo import BlogRepository
from ..models.blog import Blog

class BlogHtmlRepository(BlogRepository):
    """
    File-based implementation of the BlogRepository interface using HTML files.
    Blog posts are stored as individual .html files with metadata in JSON format.
    """

    def __init__(self, content_dir: str = "content/blog"):
        self.content_dir = Path(content_dir)
        self.posts_dir = self.content_dir / "posts"
        self.cache: Dict[str, Blog] = {}
        self._ensure_dirs_exist()

    def _ensure_dirs_exist(self) -> None:
        """Ensure all required directories exist."""
        os.makedirs(self.content_dir, exist_ok=True)
        os.makedirs(self.posts_dir, exist_ok=True)
        os.makedirs(self.content_dir / "assets" / "images", exist_ok=True)

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
            
            # Get post ID from filename (YYYY-MM-DD-slug.html -> slug)
            post_id = file_path.stem.split('-', 3)[-1]
            
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

    def get_all(self) -> List[Blog]:
        """Get all blog posts."""
        posts = []
        for file_path in self.posts_dir.glob('*.html'):
            if post := self._parse_html_file(file_path):
                posts.append(post)
                self.cache[post.id] = post
        return sorted(posts, key=lambda x: x.date, reverse=True)

    def get_by_id(self, post_id: str) -> Optional[Blog]:
        """Get a single blog post by ID."""
        # Check cache first
        if post_id in self.cache:
            return self.cache[post_id]

        # Look for matching file
        for file_path in self.posts_dir.glob('*-' + post_id + '.html'):
            if post := self._parse_html_file(file_path):
                self.cache[post_id] = post
                return post
        return None

    def get_featured(self) -> Optional[Blog]:
        """Get the featured blog post."""
        for post in self.get_all():
            if post.is_featured:
                return post
        return None

    def get_regular_posts(self) -> List[Blog]:
        """Get all non-featured blog posts."""
        return sorted(
            [post for post in self.get_all() if not post.is_featured],
            key=lambda x: x.date,
            reverse=True
        )

    def create(self, post: Blog) -> Blog:
        """Create a new blog post."""
        # Format filename
        date_str = post.date.strftime('%Y-%m-%d')
        filename = f"{date_str}-{post.id}.html"
        file_path = self.posts_dir / filename

        # Generate HTML content
        html_content = self._create_html_content(post)

        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Update cache
        self.cache[post.id] = post
        return post

    def update(self, post: Blog) -> Blog:
        """Update an existing blog post."""
        return self.create(post)  # Same operation as create

    def delete(self, post_id: str) -> bool:
        """Delete a blog post."""
        success = False
        for file_path in self.posts_dir.glob('*-' + post_id + '.html'):
            try:
                file_path.unlink()
                success = True
                if post_id in self.cache:
                    del self.cache[post_id]
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")
        return success
