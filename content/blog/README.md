# Blog Content Management System

This directory contains the blog content management system, which uses Markdown files with YAML frontmatter for managing blog posts.

## Directory Structure

```
content/blog/
├── posts/          # Markdown files for blog posts
├── assets/         # Blog-specific assets
│   └── images/     # Images used in blog posts
└── README.md       # This file
```

## Blog Post Format

Blog posts are stored as Markdown files with YAML frontmatter in the `posts/` directory. Files should be named using the format: `YYYY-MM-DD-slug.md`.

### Example Post

```markdown
---
title: Post Title
description: Brief description
category: Category Name
date: YYYY-MM-DD
read_time: X min read
image: /path/to/main/image
card_image: /path/to/card/image
is_featured: true|false
---

## Post Content

Write your post content here using Markdown.
```

### Required Fields

- `title`: Post title
- `description`: Brief description for previews
- `category`: Post category
- `date`: Publication date (YYYY-MM-DD)
- `read_time`: Estimated reading time
- `image`: Main post image path
- `card_image`: (Optional) Image for card previews
- `is_featured`: (Optional) Whether this is a featured post

## Editing Content

1. Create a new file in `posts/` using the correct naming format
2. Add the required frontmatter
3. Write your content in Markdown
4. The system will automatically:
   - Parse the frontmatter
   - Convert Markdown to HTML
   - Update the blog listings

## Features

- Markdown for easy content writing
- YAML frontmatter for metadata
- Automatic HTML conversion
- Support for featured posts
- Image management
- In-memory caching for performance