"""
Shared content functionality for articles and blogs.
Provides common attributes and methods used by both content types.
"""
from dataclasses import dataclass, field
from typing import List, Optional
from bs4 import BeautifulSoup

@dataclass(kw_only=True)
class Content:
    """Base class for shared content functionality between articles and blogs"""
    title: str
    description: str
    content: str
    keywords: List[str] = field(default_factory=list)
    custom_css_file: Optional[str] = None
    custom_styles: Optional[str] = None

    @property
    def show_toc(self) -> bool:
        """Determine if content should show TOC based on heading count.
        
        Returns:
            bool: True if content has more than 3 h2/h3 headings that aren't
                 explicitly marked to be skipped with data-toc-skip
        """
        soup = BeautifulSoup(self.content, 'html.parser')
        headings = soup.find_all(['h2', 'h3'])
        # Only count headings that don't have data-toc-skip
        visible_headings = [h for h in headings if not h.get('data-toc-skip')]
        return len(visible_headings) > 3
