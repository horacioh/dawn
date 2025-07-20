class RecipesListing {
  constructor() {
    this.container = document.querySelector('.recipes-listing');
    if (!this.container) return;

    this.grid = this.container.querySelector('.recipes-grid__container');
    this.filterButtons = this.container.querySelectorAll('.recipes-filter-btn');
    this.flavorSelect = this.container.querySelector('.recipes-flavor-select');
    this.loadMoreButton = this.container.querySelector('.recipes-load-more');
    this.loadingSpinner = this.container.querySelector('.recipes-loading');

    this.currentCategoryFilter = 'all';
    this.currentFlavorFilter = '';
    this.isLoading = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showAllRecipes();
  }

  setupEventListeners() {
    // Category filter buttons
    this.filterButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCategoryFilter(button);
      });
    });

    // Flavor select dropdown
    if (this.flavorSelect) {
      this.flavorSelect.addEventListener('change', (e) => {
        this.handleFlavorFilter(e.target.value);
      });
    }

    // Load more button
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMoreRecipes();
      });
    }
  }

  handleCategoryFilter(clickedButton) {
    // Update active button
    this.filterButtons.forEach((btn) => btn.classList.remove('active'));
    clickedButton.classList.add('active');

    // Update current filter
    this.currentCategoryFilter = clickedButton.dataset.filter;

    // Apply filters
    this.applyFilters();
  }

  handleFlavorFilter(flavorValue) {
    this.currentFlavorFilter = flavorValue;
    this.applyFilters();
  }

  applyFilters() {
    const recipeCards = this.grid.querySelectorAll('.recipes-grid__item');
    let visibleCount = 0;

    recipeCards.forEach((card) => {
      const categories = card.dataset.categories ? card.dataset.categories.split(',') : [];
      const shouldShow = this.shouldShowCard(categories);

      if (shouldShow) {
        card.classList.remove('filtered-out');
        card.style.setProperty('--animation-order', visibleCount);
        visibleCount++;
      } else {
        card.classList.add('filtered-out');
      }
    });

    // Update empty state
    this.updateEmptyState(visibleCount === 0);
  }

  shouldShowCard(categories) {
    const categoryMatch = this.currentCategoryFilter === 'all' || categories.includes(this.currentCategoryFilter);

    const flavorMatch = !this.currentFlavorFilter || categories.includes(this.currentFlavorFilter);

    return categoryMatch && flavorMatch;
  }

  showAllRecipes() {
    const recipeCards = this.grid.querySelectorAll('.recipes-grid__item');
    recipeCards.forEach((card) => {
      card.classList.remove('filtered-out');
    });
    this.updateEmptyState(false);
  }

  updateEmptyState(isEmpty) {
    let emptyState = this.container.querySelector('.recipes-empty');

    if (isEmpty && !emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'recipes-empty';
      emptyState.innerHTML = `
        <h3>No recipes found</h3>
        <p>Try adjusting your filters or check back later for new recipes!</p>
      `;
      this.grid.appendChild(emptyState);
    } else if (!isEmpty && emptyState) {
      emptyState.remove();
    }
  }

  async loadMoreRecipes() {
    if (this.isLoading || !this.loadMoreButton) return;

    const nextUrl = this.loadMoreButton.dataset.nextUrl;
    if (!nextUrl) return;

    this.isLoading = true;
    this.showLoadingState();

    try {
      const response = await fetch(nextUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Get new recipe items
      const newItems = doc.querySelectorAll('.recipes-grid__item');
      const newPaginationButton = doc.querySelector('.recipes-load-more');

      // Append new items
      newItems.forEach((item, index) => {
        // Set animation delay for new items
        const currentItemCount = this.grid.querySelectorAll('.recipes-grid__item').length;
        item.style.setProperty('--animation-order', currentItemCount + index);
        this.grid.insertBefore(item, this.container.querySelector('.recipes-pagination'));
      });

      // Update load more button
      if (newPaginationButton) {
        this.loadMoreButton.dataset.nextUrl = newPaginationButton.dataset.nextUrl;
      } else {
        // No more pages, hide load more button
        this.loadMoreButton.style.display = 'none';
      }

      // Apply current filters to new items
      this.applyFilters();

      // Trigger animations for new items
      if (window.Shopify && window.Shopify.ScrollTrigger) {
        window.Shopify.ScrollTrigger.refresh();
      }
    } catch (error) {
      console.error('Error loading more recipes:', error);
      this.showError('Failed to load more recipes. Please try again.');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  showLoadingState() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.remove('hidden');
    }
    if (this.loadMoreButton) {
      this.loadMoreButton.disabled = true;
      this.loadMoreButton.textContent = 'Loading...';
    }
  }

  hideLoadingState() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.add('hidden');
    }
    if (this.loadMoreButton) {
      this.loadMoreButton.disabled = false;
      this.loadMoreButton.textContent = 'Load More Recipes';
    }
  }

  showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'recipes-error';
    errorDiv.style.cssText = `
      background: #fee;
      color: #c53030;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 0.5rem;
      text-align: center;
    `;
    errorDiv.textContent = message;

    this.container.insertBefore(errorDiv, this.grid);

    // Remove error after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Utility functions
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RecipesListing();
});

// Handle Shopify section reloads (for theme editor)
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.recipes-listing')) {
    new RecipesListing();
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  const recipesListing = document.querySelector('.recipes-listing');
  if (recipesListing) {
    // Reset filters when navigating back
    const allButton = recipesListing.querySelector('.recipes-filter-btn[data-filter="all"]');
    const flavorSelect = recipesListing.querySelector('.recipes-flavor-select');

    if (allButton) {
      allButton.click();
    }
    if (flavorSelect) {
      flavorSelect.value = '';
      flavorSelect.dispatchEvent(new Event('change'));
    }
  }
});

// Export for potential external use
window.RecipesListing = RecipesListing;
