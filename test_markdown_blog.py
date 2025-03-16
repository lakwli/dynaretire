from classes.blog.repositories.markdown import MarkdownBlogRepository

def test_markdown_blog():
    # Initialize repository
    repo = MarkdownBlogRepository()
    
    # Test get_all()
    all_posts = repo.get_all()
    print("\nAll posts:", len(all_posts))
    for post in all_posts:
        print(f"\nPost: {post.title}")
        print(f"Date: {post.date}")
        print(f"Category: {post.category}")
        print(f"Content preview: {post.content[:100]}...")
    
    # Test get_featured()
    featured = repo.get_featured()
    if featured:
        print(f"\nFeatured post: {featured.title}")
    
    # Test get_by_id()
    post = repo.get_by_id("early-retirement-myths")
    if post:
        print(f"\nFound post by ID:")
        print(f"Title: {post.title}")
        print(f"Description: {post.description}")
        print(f"Content: {post.content}")

if __name__ == "__main__":
    test_markdown_blog()