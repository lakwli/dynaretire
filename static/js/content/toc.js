// Utility function for throttling
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

class ContentTableOfContents {
    constructor(config = {}) {
        // Allow custom selectors or use defaults
        this.selectors = {
            toc: '.content-toc',
            tocList: '.content-toc__list',
            contentBody: '.content-body',
            progressBar: '.content-progress',
            backToTop: '.back-to-top',
            tocToggle: '.content-toc-toggle',
            ...config.selectors
        };

        // Initialize elements
        this.toc = document.querySelector(this.selectors.toc);
        this.tocList = document.querySelector(this.selectors.tocList);
        this.contentBody = document.querySelector(this.selectors.contentBody);
        this.progressBar = document.querySelector(this.selectors.progressBar);
        this.backToTop = document.querySelector(this.selectors.backToTop);
        this.tocToggle = document.querySelector(this.selectors.tocToggle);
        
        // Store event listeners for cleanup
        this.listeners = new Map();
        
        // Exit if required elements aren't found
        if (!this.contentBody || !this.tocList) return;
        
        // Select h2 and h3 elements that don't have data-toc-skip attribute
        this.headings = Array.from(this.contentBody.querySelectorAll('h2:not([data-toc-skip]), h3:not([data-toc-skip])'));
        
        this.init();
    }

    init() {
        this.setupTOC();
        this.setupProgressBar();
        this.setupIntersectionObserver();
        this.setupBackToTop();
        this.setupMobileToggle();
    }

    setupTOC() {
        if (!this.tocList || this.headings.length === 0) return;

        this.headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `toc-heading-${index}`;
            }

            const listItem = document.createElement('li');
            listItem.className = 'content-toc__item';

            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.className = `content-toc__link content-toc__link--${heading.tagName.toLowerCase()}`;
            // Check if heading has an icon
            const icon = heading.querySelector('i');
            if (icon) {
                const iconClone = icon.cloneNode(true);
                link.appendChild(iconClone);
                // Add a space between icon and text
                link.appendChild(document.createTextNode(' '));
            }
            // Add the heading text
            link.appendChild(document.createTextNode(
                heading.getAttribute('data-toc-text') || 
                (heading.lastChild ? heading.lastChild.textContent.trim() : heading.textContent.trim())
            ));

            const handleClick = (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, link.href);
            };

            link.addEventListener('click', handleClick);
            this.listeners.set(link, { event: 'click', handler: handleClick });

            listItem.appendChild(link);
            this.tocList.appendChild(listItem);
        });
    }

    setupProgressBar() {
        if (!this.progressBar) return;

        const updateProgress = throttle(() => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            
            this.progressBar.style.width = `${progress}%`;
        }, 100);

        window.addEventListener('scroll', updateProgress);
        this.listeners.set(window, { event: 'scroll', handler: updateProgress });
    }

    setupIntersectionObserver() {
        const tocLinks = document.querySelectorAll('.content-toc__link');
        if (!tocLinks.length) return;

        const observerOptions = {
            rootMargin: '-80px 0px -80px 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        const observerCallback = (entries) => {
            const visibleEntries = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visibleEntries.length > 0) {
                const mostVisible = visibleEntries[0];
                const id = mostVisible.target.id;
                const tocLink = document.querySelector(`.content-toc__link[href="#${id}"]`);

                if (tocLink) {
                    tocLinks.forEach(link => link.classList.remove('content-toc__link--active'));
                    tocLink.classList.add('content-toc__link--active');
                }
            }
        };

        this.observer = new IntersectionObserver(observerCallback, observerOptions);
        this.headings.forEach(heading => this.observer.observe(heading));
    }

    setupBackToTop() {
        if (!this.backToTop) return;

        const handleScroll = throttle(() => {
            this.backToTop.classList.toggle('visible', window.scrollY > 300);
        }, 100);

        const handleClick = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };

        window.addEventListener('scroll', handleScroll);
        this.backToTop.addEventListener('click', handleClick);
        
        this.listeners.set(window, { event: 'scroll', handler: handleScroll });
        this.listeners.set(this.backToTop, { event: 'click', handler: handleClick });
    }

    setupMobileToggle() {
        if (!this.tocToggle || !this.toc) return;

        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.className = 'content-toc-overlay';
        this.toc.parentNode.insertBefore(this.overlay, this.toc.nextSibling);

        const toggleTOC = (show) => {
            this.toc.classList.toggle('active', show);
            document.body.classList.toggle('toc-active', show);
            this.tocToggle.setAttribute('aria-expanded', String(show));
            this.tocToggle.setAttribute('aria-label', 
                show ? 'Close table of contents' : 'Open table of contents'
            );
        };

        const handleToggleClick = () => toggleTOC(!this.toc.classList.contains('active'));
        const handleOverlayClick = () => toggleTOC(false);

        this.tocToggle.addEventListener('click', handleToggleClick);
        this.overlay.addEventListener('click', handleOverlayClick);

        this.listeners.set(this.tocToggle, { event: 'click', handler: handleToggleClick });
        this.listeners.set(this.overlay, { event: 'click', handler: handleOverlayClick });
    }

    cleanup() {
        // Cleanup event listeners
        this.listeners.forEach((listener, element) => {
            element.removeEventListener(listener.event, listener.handler);
        });
        this.listeners.clear();

        // Cleanup intersection observer
        if (this.observer) {
            this.observer.disconnect();
        }

        // Remove overlay
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        // Reset body class
        document.body.classList.remove('toc-active');

        // Remove TOC content
        if (this.tocList) {
            this.tocList.innerHTML = '';
        }
    }
}

// Initialize TOC only if the container exists
if (document.querySelector('.content-toc')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.contentTOC = new ContentTableOfContents();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentTableOfContents;
}
