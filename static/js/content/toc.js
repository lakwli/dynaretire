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
        
        this.headings = Array.from(this.contentBody.querySelectorAll('h2, h3'));
        
        this.init();
    }

    init() {
        try {
            this.setupTOC();
            this.setupProgressBar();
            this.setupIntersectionObserver();
            this.setupBackToTop();
            this.setupMobileToggle();
        } catch (error) {
            console.error('Error initializing TOC:', error);
        }
    }

    setupTOC() {
        if (!this.tocList || this.headings.length === 0) return;

        this.headings.forEach((heading, index) => {
            try {
                if (!heading.id) {
                    heading.id = `toc-heading-${index}`;
                }

                const listItem = document.createElement('li');
                listItem.className = 'content-toc__item';

                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.className = `content-toc__link content-toc__link--${heading.tagName.toLowerCase()}`;
                link.textContent = heading.textContent;

                const handleClick = (e) => {
                    e.preventDefault();
                    heading.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, link.href);
                };

                link.addEventListener('click', handleClick);
                this.listeners.set(link, { event: 'click', handler: handleClick });

                listItem.appendChild(link);
                this.tocList.appendChild(listItem);
            } catch (error) {
                console.error('Error setting up TOC item:', error);
            }
        });
    }

    setupProgressBar() {
        if (!this.progressBar) return;

        const updateProgress = throttle(() => {
            try {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight - windowHeight;
                const scrolled = window.scrollY;
                const progress = (scrolled / documentHeight) * 100;
                
                this.progressBar.style.width = `${progress}%`;
            } catch (error) {
                console.error('Error updating progress bar:', error);
            }
        }, 100);

        window.addEventListener('scroll', updateProgress);
        this.listeners.set(window, { event: 'scroll', handler: updateProgress });
    }

    setupIntersectionObserver() {
        const tocLinks = document.querySelectorAll('.content-toc__link');
        if (!tocLinks.length) return;

        const observerOptions = {
            rootMargin: '-80px 0px -80px 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            try {
                entries.forEach(entry => {
                    const id = entry.target.id;
                    const tocLink = document.querySelector(`.content-toc__link[href="#${id}"]`);
                    
                    if (tocLink && entry.isIntersecting) {
                        tocLinks.forEach(link => link.classList.remove('content-toc__link--active'));
                        tocLink.classList.add('content-toc__link--active');
                    }
                });
            } catch (error) {
                console.error('Error in intersection observer callback:', error);
            }
        };

        this.observer = new IntersectionObserver(observerCallback, observerOptions);
        this.headings.forEach(heading => this.observer.observe(heading));
    }

    setupBackToTop() {
        if (!this.backToTop) return;

        const handleScroll = throttle(() => {
            try {
                this.backToTop.classList.toggle('visible', window.scrollY > 300);
            } catch (error) {
                console.error('Error handling scroll for back to top:', error);
            }
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

        let touchStartX = 0;
        let touchStartY = 0;

        const toggleTOC = (show) => {
            try {
                this.toc.classList.toggle('active', show);
                document.body.classList.toggle('toc-active', show);
                this.tocToggle.setAttribute('aria-expanded', String(show));
                this.tocToggle.setAttribute('aria-label', 
                    show ? 'Close table of contents' : 'Open table of contents'
                );
            } catch (error) {
                console.error('Error toggling TOC:', error);
            }
        };

        const handleToggleClick = () => toggleTOC(!this.toc.classList.contains('active'));

        const handleOutsideClick = (e) => {
            try {
                if (!this.toc.contains(e.target) && 
                    !this.tocToggle.contains(e.target) && 
                    this.toc.classList.contains('active')) {
                    toggleTOC(false);
                }
            } catch (error) {
                console.error('Error handling outside click:', error);
            }
        };

        const handleEscape = (e) => {
            try {
                if (e.key === 'Escape' && this.toc.classList.contains('active')) {
                    toggleTOC(false);
                }
            } catch (error) {
                console.error('Error handling escape key:', error);
            }
        };

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Check if horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (this.toc.classList.contains('active') && deltaX > 50) {
                    toggleTOC(false);
                } else if (!this.toc.classList.contains('active') && deltaX < -50) {
                    toggleTOC(true);
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        };

        this.tocToggle.addEventListener('click', handleToggleClick);
        this.overlay.addEventListener('click', () => toggleTOC(false));
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);

        this.listeners.set(this.tocToggle, { event: 'click', handler: handleToggleClick });
        this.listeners.set(this.overlay, { event: 'click', handler: () => toggleTOC(false) });
        this.listeners.set(document, { event: 'click', handler: handleOutsideClick });
        this.listeners.set(document, { event: 'keydown', handler: handleEscape });
        this.listeners.set(document, { event: 'touchstart', handler: handleTouchStart });
        this.listeners.set(document, { event: 'touchmove', handler: handleTouchMove });
    }

    cleanup() {
        try {
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
        } catch (error) {
            console.error('Error cleaning up TOC:', error);
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