# TOC Implementation Plan - Simplified

## 1. Add Content Base Class (classes/content/models/content.py)

```python
# classes/content/models/content.py
from dataclasses import dataclass
from typing import List, Optional
import re

@dataclass
class Content:
    """Base class for shared content functionality between articles and blogs"""
    title: str
    description: str
    content: str
    keywords: List[str]
    custom_css_file: Optional[str]
    custom_styles: Optional[str]

    @property
    def show_toc(self) -> bool:
        """Determine if content should show TOC based on heading count"""
        heading_count = len(re.findall(r'<h[23][^>]*>.*?</h[23]>', self.content))
        return heading_count > 3
```

Update existing models:

```python
# classes/content/models/article.py
from .content import Content

@dataclass
class Article(Content):
    path: str
    type: str  # Always 'article'
    updated_at: datetime
    image: Optional[str] = None

# classes/content/models/blog.py
from .content import Content

@dataclass
class Blog(Content):
    id: str
    category: str
    date: datetime
    read_time: str
    image: str
    card_image: Optional[str] = None
    is_featured: bool = False
```

## 2. Update Template (content_base.html)

Add TOC to existing content_base.html template:

```html
{# templates/content/content_base.html #}
{% block content %}
    <div class="content-container">
        {# Add TOC if needed #}
        {% if content.show_toc %}
            <aside class="content-toc" aria-label="Table of contents">
                <h2 class="content-toc__title">Contents</h2>
                <nav><ul class="content-toc__list"></ul></nav>
            </aside>
            <div class="content-toc-overlay"></div>
            <button class="content-toc-toggle" aria-label="Toggle table of contents">
                <i class="fas fa-list"></i>
            </button>
        {% endif %}

        {# Existing content block #}
        {% block content_content %}{% endblock %}
    </div>
{% endblock %}

{% block scripts %}
    {# Load TOC script only when needed #}
    {% if content.show_toc %}
        <script src="{{ url_for('static', filename='js/content/toc.js') }}" defer></script>
    {% endif %}
    {% block content_scripts %}{% endblock %}
{% endblock %}
```

## 3. Benefits

1. **Consistent Structure**:
   - content.py aligns with content.css
   - Shared functionality in content base class
   - Follows existing template hierarchy

2. **Clean Implementation**:
   - Minimal changes to existing code
   - No complex inheritance chains
   - Simple TOC detection logic

3. **Performance**:
   - JS only loaded when needed
   - CSS already in content.css
   - No template overhead

4. **Maintainability**:
   - Clear organization
   - Easy to add more shared features
   - Consistent with project structure

## Next Steps

1. Create content.py with Content base class
2. Update Article and Blog to inherit from Content
3. Add TOC markup to content_base.html
4. Test with both article and blog content