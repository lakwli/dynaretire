"""
Shared content functionality for articles and blogs.
Provides common attributes and methods used by both content types.
"""
from dataclasses import dataclass, field
from typing import List, Optional
import re

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
            bool: True if content has more than 3 h2/h3 headings
        """
        heading_count = len(re.findall(r'<h[23][^>]*>.*?</h[23]>', self.content))
        return heading_count > 3