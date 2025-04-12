class ContentCitations {
    constructor(config = {}) {
        // Allow custom selectors or use defaults
        this.selectors = {
            citationsSection: '.citations-section',
            citationsToggle: '.toggle-citations',
            citationsContent: '.citations-content',
            jumpToRef: '.jump-to-ref',
            ...config.selectors
        };

        // Initialize elements
        this.citationsSection = document.querySelector(this.selectors.citationsSection);
        this.citationsToggle = document.querySelector(this.selectors.citationsToggle);
        this.citationsContent = document.querySelector(this.selectors.citationsContent);
        
        // Store event listeners for cleanup
        this.listeners = new Map();
        
        // Exit if required elements aren't found
        if (!this.citationsSection || !this.citationsToggle || !this.citationsContent) return;
        
        this.init();
    }

    init() {
        this.setupCitationsToggle();
        this.setupJumpToReferences();
    }

    setupCitationsToggle() {
        const handleToggle = () => {
            this.citationsContent.classList.toggle('expanded');
            this.citationsToggle.classList.toggle('expanded');
        };

        this.citationsToggle.addEventListener('click', handleToggle);
        this.listeners.set(this.citationsToggle, { event: 'click', handler: handleToggle });
    }

    setupJumpToReferences() {
        const handleJumpClick = (e) => {
            const link = e.currentTarget;
            const id = link.getAttribute('href');
            const element = document.querySelector(id);
            
            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                // Add a temporary highlight effect
                element.classList.add('highlight');
                setTimeout(() => element.classList.remove('highlight'), 2000);
            }
        };

        document.querySelectorAll(this.selectors.jumpToRef).forEach(link => {
            link.addEventListener('click', handleJumpClick);
            this.listeners.set(link, { event: 'click', handler: handleJumpClick });
        });
    }

    cleanup() {
        // Cleanup event listeners
        this.listeners.forEach((listener, element) => {
            element.removeEventListener(listener.event, listener.handler);
        });
        this.listeners.clear();
    }
}

// Initialize Citations only if the container exists
if (document.querySelector('.citations-section')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.contentCitations = new ContentCitations();
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentCitations;
}
