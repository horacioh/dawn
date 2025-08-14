/**
 * Enhanced Recipes Metaobjects JavaScript
 * Features:
 * - Advanced filtering (category, difficulty, flavor, time)
 * - Infinite scroll loading
 * - Product integration and recommendations
 * - SEO-friendly URLs
 * - Performance optimizations
 */

class RecipesMetaobjects {
  constructor() {
    this.container = document.querySelector('.recipes-listing');
    if (!this.container) return;

    // DOM elements
    this.grid = this.container.querySelector('.recipes-grid__container');
    this.loadMoreBtn = this.container.querySelector('.recipes-load-more');
    this.loadingSpinner = this.container.querySelector('.recipes-loading-spinner');
    this.emptyState = this.container.querySelector('.recipes-empty');

    // Filter elements
    this.categoryBtns = this.container.querySelectorAll('.recipes-filter-btn');
    this.difficultySelect = this.container.querySelector('.recipes-difficulty-select');
    this.flavorSelect = this.container.querySelector('.recipes-flavor-select');
    this.timeSelect = this.container.querySelector('.recipes-time-select');

    // Data and state
    this.allRecipes = [];
    this.filteredRecipes = [];
    this.displayedRecipes = [];
    this.loadedCount = 0;
    this.recipesPerLoad = 6;
    this.isLoading = false;
    this.infiniteScrollEnabled = true;

    // Current filters
    this.filters = {
      category: 'all',
      difficulty: '',
      flavor: '',
      timeRange: '',
    };

    // Intersection Observer for infinite scroll
    this.observer = null;
    this.observerTarget = null;

    this.init();
  }

  async init() {
    try {
      await this.loadRecipesData();
      this.setupEventListeners();
      this.setupInfiniteScroll();
      this.displayInitialRecipes();
      this.updateURL();
    } catch (error) {
      console.error('Error initializing recipes:', error);
      this.showError('Failed to load recipes. Please refresh the page.');
    }
  }

  async loadRecipesData() {
    const dataScript = document.getElementById('recipes-data');
    if (!dataScript) {
      throw new Error('Recipes data not found');
    }

    const data = JSON.parse(dataScript.textContent);
    this.allRecipes = data.recipes || [];
    this.recipesPerLoad = data.settings?.recipes_per_load || 6;
    this.infiniteScrollEnabled = data.settings?.infinite_scroll !== false;

    // Set initial loaded count from existing DOM
    this.loadedCount = this.grid.children.length || Math.min(this.recipesPerLoad, this.allRecipes.length);
    this.filteredRecipes = [...this.allRecipes];

    // Load URL parameters
    this.loadFiltersFromURL();
  }

  setupEventListeners() {
    // Category filter buttons
    this.categoryBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCategoryFilter(btn);
      });
    });

    // Dropdown filters
    if (this.difficultySelect) {
      this.difficultySelect.addEventListener('change', () => {
        this.filters.difficulty = this.difficultySelect.value;
        this.applyFilters();
      });
    }

    if (this.flavorSelect) {
      this.flavorSelect.addEventListener('change', () => {
        this.filters.flavor = this.flavorSelect.value;
        this.applyFilters();
      });
    }

    if (this.timeSelect) {
      this.timeSelect.addEventListener('change', () => {
        this.filters.timeRange = this.timeSelect.value;
        this.applyFilters();
      });
    }

    // Load more button
    if (this.loadMoreBtn && !this.infiniteScrollEnabled) {
      this.loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMoreRecipes();
      });
    }

    // Window events
    window.addEventListener('popstate', () => {
      this.loadFiltersFromURL();
      this.applyFilters();
    });

    // Search functionality (if search input exists)
    const searchInput = this.container.querySelector('.recipes-search');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        debounce(() => {
          this.handleSearch(searchInput.value);
        }, 300)
      );
    }
  }

  setupInfiniteScroll() {
    if (!this.infiniteScrollEnabled) return;

    // Create observer target
    this.observerTarget = document.createElement('div');
    this.observerTarget.classList.add('recipes-observer-target');
    this.observerTarget.style.height = '1px';

    if (this.loadMoreBtn) {
      this.loadMoreBtn.parentNode.insertBefore(this.observerTarget, this.loadMoreBtn);
    }

    // Setup Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isLoading && this.canLoadMore()) {
            this.loadMoreRecipes();
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    this.observer.observe(this.observerTarget);
  }

  handleCategoryFilter(clickedBtn) {
    // Update active button
    this.categoryBtns.forEach((btn) => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Update filter
    this.filters.category = clickedBtn.dataset.filter;
    this.applyFilters();
  }

  applyFilters() {
    // Filter recipes based on all active filters
    this.filteredRecipes = this.allRecipes.filter((recipe) => {
      return this.matchesFilters(recipe);
    });

    // Reset display
    this.loadedCount = 0;
    this.clearGrid();
    this.displayInitialRecipes();
    this.updateURL();
    this.updateEmptyState();
  }

  matchesFilters(recipe) {
    // Category filter
    if (this.filters.category !== 'all' && recipe.recipe_type !== this.filters.category) {
      return false;
    }

    // Difficulty filter
    if (this.filters.difficulty && recipe.difficulty !== this.filters.difficulty) {
      return false;
    }

    // Flavor filter (check tags and recipe data)
    if (this.filters.flavor) {
      const flavorMatches =
        recipe.tags.includes(this.filters.flavor) ||
        recipe.title.toLowerCase().includes(this.filters.flavor.replace('-', ' '));
      if (!flavorMatches) return false;
    }

    // Time range filter
    if (this.filters.timeRange) {
      const prepTime = recipe.prep_time;
      switch (this.filters.timeRange) {
        case '0-15':
          if (prepTime > 15) return false;
          break;
        case '15-30':
          if (prepTime <= 15 || prepTime > 30) return false;
          break;
        case '30-60':
          if (prepTime <= 30 || prepTime > 60) return false;
          break;
        case '60+':
          if (prepTime <= 60) return false;
          break;
      }
    }

    return true;
  }

  displayInitialRecipes() {
    const recipesToShow = Math.min(this.recipesPerLoad, this.filteredRecipes.length);
    for (let i = 0; i < recipesToShow; i++) {
      this.renderRecipeCard(this.filteredRecipes[i], i);
    }
    this.loadedCount = recipesToShow;
    this.updateLoadMoreButton();
  }

  async loadMoreRecipes() {
    if (this.isLoading || !this.canLoadMore()) return;

    this.isLoading = true;
    this.showLoadingState();

    try {
      // Simulate network delay for smoother UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const startIndex = this.loadedCount;
      const endIndex = Math.min(startIndex + this.recipesPerLoad, this.filteredRecipes.length);

      for (let i = startIndex; i < endIndex; i++) {
        this.renderRecipeCard(this.filteredRecipes[i], i);
      }

      this.loadedCount = endIndex;
      this.updateLoadMoreButton();

      // Trigger animations for new cards
      this.triggerScrollAnimations();
    } catch (error) {
      console.error('Error loading more recipes:', error);
      this.showError('Failed to load more recipes. Please try again.');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  renderRecipeCard(recipe, index) {
    const cardHTML = this.generateRecipeCardHTML(recipe, index);
    const cardElement = this.createElementFromHTML(cardHTML);
    this.grid.appendChild(cardElement);
  }

  generateRecipeCardHTML(recipe, index) {
    const categories = [recipe.recipe_type, recipe.difficulty].filter(Boolean).join(', ');
    const imageUrl = recipe.featured_image.url || '';
    const imageAlt = recipe.featured_image.alt || recipe.title;

    return `
      <div 
        class="recipe-card-metaobject${settings.animations_reveal_on_scroll ? ' scroll-trigger animate--slide-in' : ''}"
        data-recipe-id="${recipe.id}"
        data-recipe-type="${recipe.recipe_type}"
        data-recipe-difficulty="${recipe.difficulty}"
        data-recipe-prep-time="${recipe.prep_time}"
        data-recipe-tags="${recipe.tags.join(',')}"
        ${settings.animations_reveal_on_scroll ? `data-cascade style="--animation-order: ${index};"` : ''}
      >
        <a href="${recipe.url}" class="recipe-card-metaobject__link" aria-label="View recipe for ${recipe.title}">
          <div class="recipe-card-metaobject__image-wrapper">
            ${
              imageUrl
                ? `
              <div class="recipe-card-metaobject__image">
                <img 
                  src="${imageUrl}" 
                  alt="${imageAlt}"
                  class="recipe-card-metaobject__img"
                  loading="lazy"
                  width="400"
                  height="400"
                />
              </div>
            `
                : `
              <div class="recipe-card-metaobject__image recipe-card-metaobject__image--placeholder">
                <svg class="icon icon-serving-dish" aria-hidden="true" focusable="false" viewBox="0 0 20 20">
                  <path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
                  <path d="M10 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-0.9-2-2s0.9-2 2-2 2 0.9 2 2-0.9 2-2 2z"/>
                </svg>
              </div>
            `
            }
          </div>
          <div class="recipe-card-metaobject__content">
            <h3 class="recipe-card-metaobject__title h5">${recipe.title}</h3>
            ${
              categories
                ? `
              <div class="recipe-card-metaobject__categories">
                ${categories
                  .split(', ')
                  .map((cat) => `<span class="recipe-card-metaobject__category">${cat}</span>`)
                  .join('<span class="recipe-card-metaobject__category-separator"> • </span>')}
              </div>
            `
                : ''
            }
            ${
              recipe.prep_time > 0
                ? `
              <div class="recipe-card-metaobject__meta">
                <span class="recipe-card-metaobject__time">
                  <svg class="icon icon-stopwatch" aria-hidden="true" focusable="false" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M10 6v4l3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                  </svg>
                  ${recipe.prep_time} min
                </span>
              </div>
            `
                : ''
            }
          </div>
        </a>
      </div>
    `;
  }

  createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  canLoadMore() {
    return this.loadedCount < this.filteredRecipes.length;
  }

  updateLoadMoreButton() {
    if (!this.loadMoreBtn) return;

    if (this.canLoadMore()) {
      this.loadMoreBtn.style.display = 'inline-block';
      this.loadMoreBtn.textContent = `Load ${Math.min(
        this.recipesPerLoad,
        this.filteredRecipes.length - this.loadedCount
      )} More Recipes`;
    } else {
      this.loadMoreBtn.style.display = 'none';
    }
  }

  updateEmptyState() {
    if (this.filteredRecipes.length === 0) {
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
    }
  }

  clearGrid() {
    while (this.grid.firstChild) {
      this.grid.removeChild(this.grid.firstChild);
    }
  }

  showLoadingState() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.remove('hidden');
    }
    if (this.loadMoreBtn) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.textContent = 'Loading...';
    }
  }

  hideLoadingState() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.add('hidden');
    }
    if (this.loadMoreBtn) {
      this.loadMoreBtn.disabled = false;
      this.updateLoadMoreButton();
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'recipes-error';
    errorDiv.style.cssText = `
      background: rgba(var(--color-foreground), 0.05);
      color: rgb(var(--color-foreground));
      padding: 2rem;
      margin: 2rem 0;
      border-radius: 0.5rem;
      text-align: center;
      border: 1px solid rgba(var(--color-foreground), 0.1);
    `;
    errorDiv.innerHTML = `
      <p style="margin: 0; font-weight: 500;">${message}</p>
    `;

    this.container.insertBefore(errorDiv, this.grid);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  triggerScrollAnimations() {
    // Trigger any theme animations for newly added cards
    if (window.Shopify && window.Shopify.ScrollTrigger) {
      window.Shopify.ScrollTrigger.refresh();
    }

    // Manual animation trigger for custom animations
    const newCards = this.grid.querySelectorAll('.recipe-card-metaobject.scroll-trigger:not(.animated)');
    newCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animated');
      }, index * 100);
    });
  }

  // URL Management
  updateURL() {
    const params = new URLSearchParams();

    if (this.filters.category !== 'all') params.set('category', this.filters.category);
    if (this.filters.difficulty) params.set('difficulty', this.filters.difficulty);
    if (this.filters.flavor) params.set('flavor', this.filters.flavor);
    if (this.filters.timeRange) params.set('time', this.filters.timeRange);

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
  }

  loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    this.filters.category = params.get('category') || 'all';
    this.filters.difficulty = params.get('difficulty') || '';
    this.filters.flavor = params.get('flavor') || '';
    this.filters.timeRange = params.get('time') || '';

    // Update UI elements
    this.categoryBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === this.filters.category);
    });

    if (this.difficultySelect) this.difficultySelect.value = this.filters.difficulty;
    if (this.flavorSelect) this.flavorSelect.value = this.filters.flavor;
    if (this.timeSelect) this.timeSelect.value = this.filters.timeRange;
  }

  // Search functionality
  handleSearch(query) {
    const searchQuery = query.toLowerCase().trim();

    if (searchQuery) {
      this.filteredRecipes = this.allRecipes.filter((recipe) => {
        return (
          recipe.title.toLowerCase().includes(searchQuery) ||
          recipe.description.toLowerCase().includes(searchQuery) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
        );
      });
    } else {
      this.filteredRecipes = [...this.allRecipes];
    }

    this.loadedCount = 0;
    this.clearGrid();
    this.displayInitialRecipes();
    this.updateEmptyState();
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Utility Functions
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

// Performance optimization: Intersection Observer API support check
function supportsIntersectionObserver() {
  return (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

// Initialize
let recipesInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  if (supportsIntersectionObserver()) {
    recipesInstance = new RecipesMetaobjects();
  } else {
    // Fallback for older browsers
    console.warn('IntersectionObserver not supported, falling back to load more button');
    recipesInstance = new RecipesMetaobjects();
    if (recipesInstance) {
      recipesInstance.infiniteScrollEnabled = false;
    }
  }
});

// Handle Shopify theme editor
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.recipes-listing')) {
    if (recipesInstance) {
      recipesInstance.destroy();
    }
    recipesInstance = new RecipesMetaobjects();
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  if (event.target.querySelector('.recipes-listing') && recipesInstance) {
    recipesInstance.destroy();
    recipesInstance = null;
  }
});

// Export for external access
window.RecipesMetaobjects = RecipesMetaobjects;
