/* Custom Megamenu Carousel JavaScript */

class MegamenuCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.track = container.querySelector('.mobile-carousel-track');
    this.items = Array.from(container.querySelectorAll('.mobile-carousel-item'));

    if (!this.track || this.items.length === 0) return;

    this.options = {
      autoScroll: options.autoScroll !== false,
      autoScrollSpeed: options.autoScrollSpeed || 4000,
      touchEnabled: options.touchEnabled !== false,
      pauseOnHover: options.pauseOnHover !== false,
      ...options,
    };

    this.currentIndex = 0;
    this.isAutoScrolling = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.autoScrollTimer = null;
    this.itemWidth = 0;
    this.visibleItems = 0;
    this.totalItems = this.items.length;

    this.init();
  }

  init() {
    this.setupInfiniteScroll();
    this.calculateDimensions();
    this.setupEventListeners();
    this.setupAutoScroll();
    this.setupAccessibility();
  }

  setupInfiniteScroll() {
    // Clone items for infinite scroll effect
    const clonedItems = this.items.map((item) => item.cloneNode(true));

    // Add cloned items to the end
    clonedItems.forEach((item) => {
      this.track.appendChild(item);
    });

    // Add cloned items to the beginning
    clonedItems
      .slice()
      .reverse()
      .forEach((item) => {
        this.track.insertBefore(item.cloneNode(true), this.track.firstChild);
      });

    // Update items array to include all items
    this.allItems = Array.from(this.track.querySelectorAll('.mobile-carousel-item'));
    this.startIndex = this.totalItems; // Start from the first original item
    this.currentIndex = this.startIndex;
  }

  calculateDimensions() {
    if (this.items.length === 0) return;

    const containerWidth = this.container.offsetWidth;
    const firstItem = this.items[0];
    const itemStyle = window.getComputedStyle(firstItem);

    this.itemWidth = firstItem.offsetWidth + parseInt(itemStyle.marginRight || 0) + parseInt(itemStyle.marginLeft || 0);
    this.visibleItems = Math.floor(containerWidth / this.itemWidth);

    // Set initial position
    this.updatePosition(false);
  }

  setupEventListeners() {
    // Touch events
    if (this.options.touchEnabled) {
      this.setupTouchEvents();
    }

    // Mouse events for desktop
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoScroll());
      this.container.addEventListener('mouseleave', () => this.resumeAutoScroll());
    }

    // Resize handler
    window.addEventListener(
      'resize',
      this.debounce(() => {
        this.calculateDimensions();
      }, 250)
    );

    // Focus events for accessibility
    this.container.addEventListener('focusin', () => this.pauseAutoScroll());
    this.container.addEventListener('focusout', () => this.resumeAutoScroll());
  }

  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let moveX = 0;
    let moveY = 0;
    let isScrolling = false;

    this.container.addEventListener(
      'touchstart',
      (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        this.pauseAutoScroll();
      },
      { passive: true }
    );

    this.container.addEventListener(
      'touchmove',
      (e) => {
        if (!e.touches[0]) return;

        const touch = e.touches[0];
        moveX = touch.clientX - startX;
        moveY = touch.clientY - startY;

        // Determine scroll direction
        if (Math.abs(moveX) > Math.abs(moveY) && Math.abs(moveX) > 10) {
          isScrolling = true;
          e.preventDefault(); // Prevent vertical scrolling
        }
      },
      { passive: false }
    );

    this.container.addEventListener('touchend', (e) => {
      if (!isScrolling) {
        this.resumeAutoScroll();
        return;
      }

      // Determine swipe direction
      const threshold = 50;
      if (Math.abs(moveX) > threshold) {
        if (moveX > 0) {
          this.prev();
        } else {
          this.next();
        }
      }

      // Reset values
      startX = 0;
      startY = 0;
      moveX = 0;
      moveY = 0;
      isScrolling = false;

      // Resume auto-scroll after a delay
      setTimeout(() => {
        this.resumeAutoScroll();
      }, 2000);
    });
  }

  setupAutoScroll() {
    if (!this.options.autoScroll) return;

    this.startAutoScroll();
  }

  setupAccessibility() {
    // Add ARIA attributes
    this.container.setAttribute('aria-label', 'Product carousel');
    this.container.setAttribute('role', 'region');

    // Add keyboard navigation
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.next();
          break;
        case ' ':
          e.preventDefault();
          this.toggleAutoScroll();
          break;
      }
    });
  }

  startAutoScroll() {
    if (this.isAutoScrolling) return;

    this.isAutoScrolling = true;
    this.autoScrollTimer = setInterval(() => {
      this.next();
    }, this.options.autoScrollSpeed);
  }

  pauseAutoScroll() {
    if (!this.isAutoScrolling) return;

    clearInterval(this.autoScrollTimer);
    this.isAutoScrolling = false;
  }

  resumeAutoScroll() {
    if (this.isAutoScrolling || !this.options.autoScroll) return;

    this.startAutoScroll();
  }

  toggleAutoScroll() {
    if (this.isAutoScrolling) {
      this.pauseAutoScroll();
    } else {
      this.resumeAutoScroll();
    }
  }

  next() {
    this.currentIndex++;
    this.updatePosition();
    this.handleInfiniteLoop();
  }

  prev() {
    this.currentIndex--;
    this.updatePosition();
    this.handleInfiniteLoop();
  }

  goTo(index) {
    this.currentIndex = this.startIndex + index;
    this.updatePosition();
  }

  updatePosition(animate = true) {
    const offset = -this.currentIndex * this.itemWidth;

    if (animate) {
      this.track.style.transition = 'transform 0.5s ease';
    } else {
      this.track.style.transition = 'none';
    }

    this.track.style.transform = `translateX(${offset}px)`;

    // Remove transition after animation
    if (animate) {
      setTimeout(() => {
        this.track.style.transition = '';
      }, 500);
    }
  }

  handleInfiniteLoop() {
    // Check if we need to reset position for infinite loop
    setTimeout(() => {
      if (this.currentIndex >= this.startIndex + this.totalItems) {
        this.currentIndex = this.startIndex;
        this.updatePosition(false);
      } else if (this.currentIndex < this.startIndex) {
        this.currentIndex = this.startIndex + this.totalItems - 1;
        this.updatePosition(false);
      }
    }, 500);
  }

  getCurrentItem() {
    const actualIndex = (this.currentIndex - this.startIndex) % this.totalItems;
    return this.items[actualIndex];
  }

  destroy() {
    this.pauseAutoScroll();

    // Remove cloned items
    this.allItems.forEach((item, index) => {
      if (index < this.startIndex || index >= this.startIndex + this.totalItems) {
        item.remove();
      }
    });

    // Reset styles
    this.track.style.transform = '';
    this.track.style.transition = '';

    // Remove event listeners
    window.removeEventListener('resize', this.calculateDimensions);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
  initializeMegamenuCarousels();
});

// Initialize carousels on dynamic content load
document.addEventListener('shopify:section:load', () => {
  initializeMegamenuCarousels();
});

function initializeMegamenuCarousels() {
  const carouselContainers = document.querySelectorAll('.mobile-carousel-wrapper');

  carouselContainers.forEach((container) => {
    // Skip if already initialized
    if (container.megamenuCarousel) return;

    // Get speed from theme settings
    const speed = parseInt(document.documentElement.style.getPropertyValue('--mobile-carousel-speed') || '4') * 1000;

    // Initialize carousel
    container.megamenuCarousel = new MegamenuCarousel(container, {
      autoScrollSpeed: speed,
      autoScroll: true,
      touchEnabled: true,
      pauseOnHover: true,
    });
  });
}

// Utility functions for theme integration
function updateCarouselSpeed(speed) {
  const carouselContainers = document.querySelectorAll('.mobile-carousel-wrapper');

  carouselContainers.forEach((container) => {
    if (container.megamenuCarousel) {
      container.megamenuCarousel.options.autoScrollSpeed = speed * 1000;
      container.megamenuCarousel.pauseAutoScroll();
      container.megamenuCarousel.startAutoScroll();
    }
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MegamenuCarousel, initializeMegamenuCarousels, updateCarouselSpeed };
}
