class ImageZoom {
    constructor(options = {}) {
        this.modalClass = options.modalClass || 'content-image-modal';
        this.contentClass = options.contentClass || 'content-modal-content';
        this.closeClass = options.closeClass || 'content-modal-close';
        this.zoomableSelector = '[data-zoomable]';
        this.initialize();
    }

    initialize() {
        // Create modal once when first needed
        this.createModal();
        this.addEventListeners();
    }

    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = this.modalClass;
        
        // Create close button
        this.closeBtn = document.createElement('span');
        this.closeBtn.className = this.closeClass;
        this.closeBtn.innerHTML = '&times;';
        
        // Create image container
        this.modalImg = document.createElement('img');
        this.modalImg.className = this.contentClass;
        
        // Assemble modal
        this.modal.appendChild(this.closeBtn);
        this.modal.appendChild(this.modalImg);
        document.body.appendChild(this.modal);
    }

    addEventListeners() {
        // Add click handlers to all zoomable images
        document.querySelectorAll(this.zoomableSelector).forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => this.openModal(img.src));
        });
        
        // Close modal when clicking the close button
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside the image
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
    }

    openModal(src) {
        this.modalImg.src = src;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }

    isModalOpen() {
        return this.modal.style.display === 'block';
    }
}

// Make available globally
window.ImageZoom = ImageZoom;