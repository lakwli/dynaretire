# Blog Template Implementation Plan

## Directory Structure

```
templates/
├── blog/
    ├── blog_base.html     # Base template for blog
    ├── blog_list.html     # Main blog listing page
    ├── article.html       # Template for individual articles
    └── components/
        ├── article_card.html
        ├── featured_post.html
        └── category_tag.html

static/css/
├── blog/
    ├── blog.css          # Main blog styles
    ├── article.css       # Article page styles
    └── components/
        ├── cards.css
        └── featured.css
```

## Template Specifications

### blog_base.html
```html
{% extends "base.html" %}

{% block meta %}
    <!-- Blog-specific meta tags -->
{% endblock %}

{% block content %}
    <!-- Blog-specific structure -->
    <div class="blog-container">
        {% block blog_content %}{% endblock %}
    </div>
{% endblock %}
```

### blog_list.html
```html
{% extends "blog/blog_base.html" %}

{% block blog_content %}
    <!-- Header Section -->
    <header class="blog-header">
        <h1>DynaRetire Blog</h1>
        <p>Insights and guides for retirement planning</p>
    </header>

    <!-- Featured Post Section -->
    {% include "blog/components/featured_post.html" %}

    <!-- Article Grid -->
    <section class="article-grid">
        {% for article in articles %}
            {% include "blog/components/article_card.html" %}
        {% endfor %}
    </section>
{% endblock %}
```

### article.html
```html
{% extends "blog/blog_base.html" %}

{% block blog_content %}
    <article class="blog-article">
        <!-- Article header -->
        <header class="article-header">
            {% include "blog/components/category_tag.html" %}
            <h1>{{ article.title }}</h1>
            <div class="article-meta">
                <span class="read-time">{{ article.read_time }} min read</span>
                <span class="publish-date">{{ article.date }}</span>
            </div>
        </header>

        <!-- Article content -->
        <div class="article-content">
            {{ article.content }}
        </div>

        <!-- Article footer -->
        <footer class="article-footer">
            <!-- Social sharing -->
            <!-- Related articles -->
        </footer>
    </article>
{% endblock %}
```

## CSS Structure

### blog.css
- Container layouts
- Typography styles
- Responsive grid system
- Common blog elements

### article.css
- Article-specific layouts
- Content typography
- Code block styling
- Image handling
- Table styles

### components/cards.css
- Article card layouts
- Hover effects
- Image aspect ratios
- Category tag styling

### components/featured.css
- Featured post layout
- Large image handling
- Featured content typography

## Implementation Steps

1. Set up directory structure
2. Create base templates
3. Implement CSS files
4. Create component templates
5. Add responsive design
6. Test with sample content
7. Add blog functionality to app.py

## Next Steps

1. Switch to Code mode to create directories and implement templates
2. Test basic structure with sample content
3. Iterate on design and functionality
4. Keep showcase.html untouched until final phase

## Notes

- Maintain current design language
- Keep consistent with existing color scheme
- Ensure responsive design
- Optimize for readability
- Plan for future scaling