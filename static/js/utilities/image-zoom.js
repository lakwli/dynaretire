class ImageZoom {
    constructor(options = {}) {
        this.modalClass = options.modalClass || 'content-image-modal';
        this.contentClass = options.contentClass || 'content-modal-content';
        this.closeClass = options.closeClass || 'content-modal-close';
        this.zoomableSelector = '[data-zoomable]';
        this.onOpen = options.onOpen || (() => {});
        this.onClose = options.onClose || (() => {});
        this.initialize();
    }

    initialize() {
        // Only create modal and add listeners if there are zoomable images
        if (document.querySelector(this.zoomableSelector)) {
            this.createModal();
            this.addEventListeners();
        }
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
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(img.src);
            });
        });
        
        // Close modal when clicking the close button
        this.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal();
        });
        
        // Close modal when clicking outside the image
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                e.preventDefault();
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
        if (!this.modal) return;
        this.modalImg.src = src;
        this.modal.style.display = 'block';
        this.onOpen();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        this.onClose();
    }

    isModalOpen() {
        return this.modal && this.modal.style.display === 'block';
    }
}

// Make available globally
window.ImageZoom = ImageZoom;
