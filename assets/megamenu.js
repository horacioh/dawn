/* Custom Megamenu JavaScript */

class CustomMegamenu {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAccessibility();
    this.setupMobile();
    this.preventBodyScrollWhenMenuOpen();
  }

  setupEventListeners() {
    // Desktop megamenu hover interactions
    this.setupDesktopHover();

    // Mobile menu toggle
    this.setupMobileToggle();

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Click outside to close
    this.setupClickOutside();
  }

  setupDesktopHover() {
    const megamenus = document.querySelectorAll('.custom-megamenu');

    if (!megamenus.length) return;

    megamenus.forEach((megamenu) => {
      const trigger = megamenu.querySelector('.custom-megamenu__trigger');
      const dropdown = megamenu.querySelector('.custom-megamenu__dropdown');

      if (!trigger || !dropdown) return;

      let hoverTimeout;

      // Show megamenu on hover
      megamenu.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        this.showMegamenu(megamenu, trigger, dropdown);
      });

      // Hide megamenu on mouse leave with delay
      megamenu.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          this.hideMegamenu(megamenu, trigger, dropdown);
        }, 150); // Small delay to prevent accidental hiding
      });

      // Keep megamenu open when hovering over dropdown
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
      });

      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          this.hideMegamenu(megamenu, trigger, dropdown);
        }, 150);
      });
    });
  }

  setupMobileToggle() {
    const hamburger = document.querySelector('.mobile-menu-trigger');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const closeButton = document.querySelector('.mobile-menu-overlay__close');

    if (!hamburger || !mobileOverlay || !closeButton) {
      return;
    }

    // Find the details element that contains the hamburger
    const detailsElement = hamburger.closest('details');

    if (detailsElement) {
      // Completely disable the details element behavior
      detailsElement.addEventListener('click', (e) => {
        e.preventDefault();
      });

      // Handle toggle events
      detailsElement.addEventListener('toggle', (e) => {
        e.preventDefault();
        detailsElement.removeAttribute('open');
      });

      // Override any existing event listeners
      hamburger.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.toggleMobileMenu();
        },
        true
      ); // Use capture phase to ensure our handler runs first
    } else {
      // Fallback if no details element
      hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }

    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeMobileMenu();
    });

    // Close menu when clicking outside
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target === mobileOverlay) {
        this.closeMobileMenu();
      }
    });
  }

  setupKeyboardNavigation() {
    // Escape key closes menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllMegamenus();
        this.closeMobileMenu();
      }
    });

    // Tab navigation support for all megamenus
    const megamenuDropdowns = document.querySelectorAll('.custom-megamenu__dropdown');
    megamenuDropdowns.forEach((dropdown) => {
      dropdown.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.handleTabNavigation(e, dropdown);
        }
      });
    });
  }

  setupClickOutside() {
    document.addEventListener('click', (e) => {
      const megamenus = document.querySelectorAll('.custom-megamenu');
      const mobileOverlay = document.querySelector('.mobile-menu-overlay');
      const backdrop = document.querySelector('.custom-megamenu__backdrop');

      // Close desktop megamenus if clicking outside any of them (but not on backdrop)
      let clickedInsideMegamenu = false;
      megamenus.forEach((megamenu) => {
        if (megamenu.contains(e.target)) {
          clickedInsideMegamenu = true;
        }
      });

      // Don't close if clicking on backdrop (it has its own click handler)
      if (!clickedInsideMegamenu && e.target !== backdrop) {
        this.hideAllMegamenus();
      }

      // Close mobile menu if clicking outside
      if (mobileOverlay && mobileOverlay.classList.contains('active') && !mobileOverlay.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  setupAccessibility() {
    // Add ARIA attributes to all megamenus
    const megamenus = document.querySelectorAll('.custom-megamenu');

    megamenus.forEach((megamenu, index) => {
      const trigger = megamenu.querySelector('.custom-megamenu__trigger');
      const dropdown = megamenu.querySelector('.custom-megamenu__dropdown');

      if (trigger && dropdown) {
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');

        // Get menu title for accessible label
        const menuTitle = trigger.querySelector('span').textContent;
        dropdown.setAttribute('aria-label', `${menuTitle} menu`);

        // Generate unique IDs for ARIA references
        const dropdownId = 'megamenu-dropdown-' + index + '-' + Math.random().toString(36).substr(2, 6);
        dropdown.setAttribute('id', dropdownId);
        trigger.setAttribute('aria-controls', dropdownId);
      }
    });
  }

  setupMobile() {
    // Update mobile menu on resize
    window.addEventListener(
      'resize',
      this.debounce(() => {
        if (window.innerWidth > 749) {
          this.closeMobileMenu();
        }
      }, 250)
    );
  }

  preventBodyScrollWhenMenuOpen() {
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    // Prevent body scroll when mobile menu is open
    if (mobileOverlay) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isActive = mobileOverlay.classList.contains('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
          }
        });
      });

      observer.observe(mobileOverlay, { attributes: true });
    }

    // Note: We don't prevent body scroll for desktop megamenus since they appear below the header
    // and users should still be able to scroll and interact with the page
  }

  showMegamenu(megamenu, trigger, dropdown) {
    if (!dropdown || !trigger) return;

    // Close other open megamenus first
    this.hideAllMegamenus(megamenu);

    // Add backdrop if it doesn't exist
    this.addBackdrop();

    // Show megamenu
    dropdown.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');

    // Show backdrop
    const backdrop = document.querySelector('.custom-megamenu__backdrop');
    if (backdrop) {
      backdrop.classList.add('active');
    }

    // Announce to screen readers
    const menuTitle = trigger.querySelector('span').textContent;
    this.announceToScreenReader(`${menuTitle} menu opened`);
  }

  hideMegamenu(megamenu, trigger, dropdown) {
    if (!dropdown || !trigger) return;

    dropdown.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');

    // Hide backdrop if no megamenus are open
    const openMegamenus = document.querySelectorAll('.custom-megamenu__dropdown.active');
    if (openMegamenus.length === 0) {
      const backdrop = document.querySelector('.custom-megamenu__backdrop');
      if (backdrop) {
        backdrop.classList.remove('active');
      }
    }
  }

  hideAllMegamenus(exceptMegamenu = null) {
    const megamenus = document.querySelectorAll('.custom-megamenu');
    let hasActiveMegamenu = false;

    megamenus.forEach((megamenu) => {
      if (megamenu === exceptMegamenu) {
        hasActiveMegamenu = true;
        return;
      }

      const trigger = megamenu.querySelector('.custom-megamenu__trigger');
      const dropdown = megamenu.querySelector('.custom-megamenu__dropdown');

      if (trigger && dropdown) {
        dropdown.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Hide backdrop if no megamenus are active
    if (!hasActiveMegamenu) {
      const backdrop = document.querySelector('.custom-megamenu__backdrop');
      if (backdrop) {
        backdrop.classList.remove('active');
      }
    }
  }

  addBackdrop() {
    // Check if backdrop already exists
    let backdrop = document.querySelector('.custom-megamenu__backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'custom-megamenu__backdrop';
      backdrop.addEventListener('click', () => {
        this.hideAllMegamenus();
      });
      document.body.appendChild(backdrop);
    }
  }

  toggleMobileMenu() {
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    if (!mobileOverlay) return;

    if (mobileOverlay.classList.contains('active')) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    if (!mobileOverlay) return;

    mobileOverlay.classList.add('active');

    // Focus on close button for accessibility
    const closeButton = document.querySelector('.mobile-menu-overlay__close');
    if (closeButton) {
      setTimeout(() => closeButton.focus(), 100);
    }

    // Announce to screen readers
    this.announceToScreenReader('Mobile menu opened');
  }

  closeMobileMenu() {
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    if (!mobileOverlay) return;

    mobileOverlay.classList.remove('active');

    // Return focus to hamburger button
    const hamburger = document.querySelector('.mobile-menu-trigger');
    if (hamburger) {
      hamburger.focus();
    }
  }

  handleTabNavigation(e, dropdown) {
    if (!dropdown) return;

    const focusableElements = dropdown.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
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

// Utility function to handle product clicks
function handleProductClick(productHandle) {
  if (productHandle) {
    window.location.href = `/products/${productHandle}`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CustomMegamenu();
});

// Handle dynamic content loading (for themes with AJAX)
document.addEventListener('shopify:section:load', () => {
  new CustomMegamenu();
});

// Screen reader only class for accessibility
const srOnlyStyles = `
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
`;

// Add screen reader styles
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = srOnlyStyles;
document.head.appendChild(styleSheet);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomMegamenu;
}
