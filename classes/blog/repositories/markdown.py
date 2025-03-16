import os
from datetime import datetime
from typing import List, Optional, Dict
import frontmatter
import markdown
from pathlib import Path

from .base import BlogRepository
from ..models.blog_post import BlogPost

class MarkdownBlogRepository(BlogRepository):
    """
    File-based implementation of the BlogRepository interface using Markdown files.
    Blog posts are stored as individual .md files with YAML frontmatter.
    """

    def __init__(self, content_dir: str = "content/blog"):
        self.content_dir = Path(content_dir)
        self.posts_dir = self.content_dir / "posts"
        self.cache: Dict[str, BlogPost] = {}
        self._ensure_dirs_exist()

    def _ensure_dirs_exist(self) -> None:
        """Ensure all required directories exist."""
        os.makedirs(self.content_dir, exist_ok=True)
        os.makedirs(self.posts_dir, exist_ok=True)
        os.makedirs(self.content_dir / "assets" / "images", exist_ok=True)

    def _parse_markdown_file(self, file_path: Path) -> Optional[BlogPost]:
        """Parse a markdown file into a BlogPost object."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
                
                # Convert markdown content to HTML
                html_content = markdown.markdown(
                    post.content,
                    extensions=['extra', 'smarty']
                )

                # Get post ID from filename (YYYY-MM-DD-slug.md -> slug)
                post_id = file_path.stem.split('-', 3)[-1]

                # Convert date string to datetime if needed
                date = post.get('date')
                if isinstance(date, str):
                    date = datetime.fromisoformat(date)

                return BlogPost(
                    id=post_id,
                    title=post.get('title', ''),
                    description=post.get('description', ''),
                    content=html_content,
                    category=post.get('category', ''),
                    date=date,
                    read_time=post.get('read_time', ''),
                    image=post.get('image', ''),
                    card_image=post.get('card_image'),
                    is_featured=post.get('is_featured', False)
                )
        except Exception as e:
            print(f"Error parsing markdown file {file_path}: {e}")
            return None

    def get_all(self) -> List[BlogPost]:
        """Get all blog posts."""
        posts = []
        for file_path in self.posts_dir.glob('*.md'):
            if post := self._parse_markdown_file(file_path):
                posts.append(post)
                self.cache[post.id] = post
        return sorted(posts, key=lambda x: x.date, reverse=True)

    def get_by_id(self, post_id: str) -> Optional[BlogPost]:
        """Get a single blog post by ID."""
        # Check cache first
        if post_id in self.cache:
            return self.cache[post_id]

        # Look for matching file
        for file_path in self.posts_dir.glob('*-' + post_id + '.md'):
            if post := self._parse_markdown_file(file_path):
                self.cache[post_id] = post
                return post
        return None

    def get_featured(self) -> Optional[BlogPost]:
        """Get the featured blog post."""
        for post in self.get_all():
            if post.is_featured:
                return post
        return None

    def get_regular_posts(self) -> List[BlogPost]:
        """Get all non-featured blog posts."""
        return sorted(
            [post for post in self.get_all() if not post.is_featured],
            key=lambda x: x.date,
            reverse=True
        )

    def create(self, post: BlogPost) -> BlogPost:
        """Create a new blog post."""
        # Format filename
        date_str = post.date.strftime('%Y-%m-%d')
        filename = f"{date_str}-{post.id}.md"
        file_path = self.posts_dir / filename

        # Prepare frontmatter content
        content = frontmatter.Post(
            post.content,
            title=post.title,
            description=post.description,
            category=post.category,
            date=post.date.isoformat(),
            read_time=post.read_time,
            image=post.image,
            card_image=post.card_image,
            is_featured=post.is_featured
        )

        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            frontmatter.dump(content, f)

        # Update cache
        self.cache[post.id] = post
        return post

    def update(self, post: BlogPost) -> BlogPost:
        """Update an existing blog post."""
        return self.create(post)  # Same operation as create

    def delete(self, post_id: str) -> bool:
        """Delete a blog post."""
        success = False
        for file_path in self.posts_dir.glob('*-' + post_id + '.md'):
            try:
                file_path.unlink()
                success = True
                if post_id in self.cache:
                    del self.cache[post_id]
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")
        return success