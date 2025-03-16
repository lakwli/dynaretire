import os
from datetime import datetime
from typing import List, Optional, Dict
import frontmatter
import markdown
from pathlib import Path

from .blog_repo import BlogRepository
from ..models.article import Article

class ArticleMarkdownRepository:
    """
    File-based repository for static articles using Markdown files.
    Articles are stored as individual .md files with YAML frontmatter.
    """

    def __init__(self, content_dir: str = "content/articles"):
        self.content_dir = Path(content_dir)
        self.cache: Dict[str, Article] = {}
        self._ensure_dirs_exist()

    def _ensure_dirs_exist(self) -> None:
        """Ensure all required directories exist."""
        os.makedirs(self.content_dir, exist_ok=True)

    def _parse_markdown_file(self, file_path: Path) -> Optional[Article]:
        """Parse a markdown file into an Article object."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                article = frontmatter.load(f)
                
                # Convert markdown content to HTML
                html_content = markdown.markdown(
                    article.content,
                    extensions=['extra', 'smarty']
                )

                # Get article path relative to content dir
                rel_path = str(file_path.relative_to(self.content_dir)).replace('.md', '')

                # Convert date string to datetime if needed
                updated_at = article.get('updated_at')
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at)

                return Article(
                    path=rel_path,
                    title=article.get('title', ''),
                    description=article.get('description', ''),
                    content=html_content,
                    type='article',
                    updated_at=updated_at,
                    image=article.get('image')
                )
        except Exception as e:
            print(f"Error parsing markdown file {file_path}: {e}")
            return None

    def get_all(self) -> List[Article]:
        """Get all articles."""
        articles = []
        for file_path in self.content_dir.rglob('*.md'):
            if article := self._parse_markdown_file(file_path):
                articles.append(article)
                self.cache[article.path] = article
        return sorted(articles, key=lambda x: x.updated_at, reverse=True)

    def get_by_path(self, article_path: str) -> Optional[Article]:
        """Get a single article by its path."""
        # Check cache first
        if article_path in self.cache:
            return self.cache[article_path]

        # Look for file
        file_path = self.content_dir / f"{article_path}.md"
        if file_path.exists():
            if article := self._parse_markdown_file(file_path):
                self.cache[article_path] = article
                return article
        return None

    def create(self, article: Article) -> Article:
        """Create a new article."""
        # Ensure parent directories exist
        file_path = self.content_dir / f"{article.path}.md"
        os.makedirs(file_path.parent, exist_ok=True)

        # Prepare frontmatter content
        content = frontmatter.Post(
            article.content,
            title=article.title,
            description=article.description,
            type='article',
            updated_at=article.updated_at.isoformat(),
            image=article.image
        )

        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            frontmatter.dump(content, f)

        # Update cache
        self.cache[article.path] = article
        return article

    def update(self, article: Article) -> Article:
        """Update an existing article."""
        return self.create(article)  # Same operation as create

    def delete(self, article_path: str) -> bool:
        """Delete an article."""
        file_path = self.content_dir / f"{article_path}.md"
        try:
            if file_path.exists():
                file_path.unlink()
                if article_path in self.cache:
                    del self.cache[article_path]
                return True
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
        return False