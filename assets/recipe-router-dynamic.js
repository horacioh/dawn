/**
 * Dynamic Recipe Router
 *
 * Handles clean URL routing for recipes on a single page.
 * URLs like /pages/recipe/turmeric-herb-spritz work without individual page creation.
 *
 * Features:
 * - Clean URL routing via History API
 * - Dynamic content loading
 * - SEO meta tag updates
 * - Browser history support
 * - Recipe filtering and search
 * - Infinite scroll
 */

class RecipeRouter {
  constructor() {
    this.recipesData = null;
    this.settings = null;
    this.translations = null;
    this.currentRecipe = null;
    this.filteredRecipes = [];
    this.displayedRecipes = [];
    this.currentPage = 1;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.handleInitialLoad();
  }

  loadData() {
    const dataScript = document.getElementById('recipes-data');
    if (dataScript) {
      try {
        const data = JSON.parse(dataScript.textContent);
        this.recipesData = data.recipes || [];
        this.settings = data.settings || {};
        this.translations = data.translations || {};
        this.filteredRecipes = [...this.recipesData];
      } catch (error) {
        console.error('Error loading recipes data:', error);
        this.recipesData = [];
      }
    }
  }

  bindEvents() {
    // Handle popstate (browser back/forward)
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname, false);
    });

    // Handle recipe card clicks
    document.addEventListener('click', (e) => {
      const recipeCard = e.target.closest('.recipe-card-metaobject__link');
      if (recipeCard) {
        e.preventDefault();
        const href = recipeCard.getAttribute('href');
        this.navigateToRecipe(href);
      }
    });

    // Handle back to recipes buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('#back-to-recipes, #back-to-recipes-404')) {
        e.preventDefault();
        this.navigateToListing();
      }
    });

    // Handle filter buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.recipes-listing__filter-button')) {
        this.handleFilterClick(e.target);
      }
    });

    // Handle search input
    const searchInput = document.getElementById('recipe-search');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        this.debounce((e) => {
          this.handleSearch(e.target.value);
        }, 300)
      );
    }

    // Handle load more / infinite scroll
    const loadMoreBtn = document.getElementById('load-more-recipes');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreRecipes();
      });
    }

    // Infinite scroll observer
    if (this.settings.enable_infinite_scroll) {
      this.setupInfiniteScroll();
    }
  }

  handleInitialLoad() {
    const currentPath = window.location.pathname;
    this.handleRoute(currentPath, false);
  }

  handleRoute(path, pushState = true) {
    const basePage = `/pages/${this.settings.page_handle}`;

    if (path === basePage || path === `${basePage}/`) {
      // Show recipe listing
      this.showRecipeListing(pushState);
    } else if (path.startsWith(`${basePage}/`)) {
      // Show individual recipe
      const recipeSlug = path.replace(`${basePage}/`, '');
      this.showRecipe(recipeSlug, pushState);
    } else {
      // Fallback: check for query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const recipeParam = urlParams.get('recipe');
      if (recipeParam) {
        this.showRecipe(recipeParam, pushState);
      } else {
        this.showRecipeListing(pushState);
      }
    }
  }

  navigateToRecipe(url) {
    const path = new URL(url, window.location.origin).pathname;
    this.handleRoute(path, true);
    history.pushState(null, '', url);
  }

  navigateToListing() {
    const baseUrl = `/pages/${this.settings.page_handle}`;
    this.showRecipeListing(true);
    history.pushState(null, '', baseUrl);
  }

  showRecipeListing(pushState) {
    // Hide other views
    document.getElementById('recipe-single-view').style.display = 'none';
    document.getElementById('recipe-not-found-view').style.display = 'none';

    // Show listing view
    document.getElementById('recipe-listing-view').style.display = 'block';

    // Reset page title and meta
    this.updatePageMeta({
      title: document.title.split(' - ')[0], // Keep original page title
      description: document.querySelector('meta[name="description"]')?.content || '',
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }

  showRecipe(recipeSlug, pushState) {
    const recipe = this.findRecipeBySlug(recipeSlug);

    if (!recipe) {
      this.showRecipeNotFound();
      return;
    }

    this.currentRecipe = recipe;

    // Hide other views
    document.getElementById('recipe-listing-view').style.display = 'none';
    document.getElementById('recipe-not-found-view').style.display = 'none';

    // Show single recipe view
    document.getElementById('recipe-single-view').style.display = 'block';

    // Populate recipe content
    this.populateRecipeContent(recipe);

    // Update page meta for SEO
    this.updateRecipeMeta(recipe);

    // Scroll to top
    window.scrollTo(0, 0);
  }

  showRecipeNotFound() {
    // Hide other views
    document.getElementById('recipe-listing-view').style.display = 'none';
    document.getElementById('recipe-single-view').style.display = 'none';

    // Show not found view
    document.getElementById('recipe-not-found-view').style.display = 'block';

    // Scroll to top
    window.scrollTo(0, 0);
  }

  findRecipeBySlug(slug) {
    return this.recipesData.find((recipe) => recipe.slug === slug);
  }

  populateRecipeContent(recipe) {
    // Update title and breadcrumb
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-breadcrumb-title').textContent = recipe.title;

    // Update description
    const descriptionEl = document.getElementById('recipe-description');
    if (recipe.description) {
      descriptionEl.innerHTML = recipe.description;
      descriptionEl.style.display = 'block';
    } else {
      descriptionEl.style.display = 'none';
    }

    // Update meta info
    this.populateRecipeMeta(recipe);

    // Update timing
    this.populateRecipeTiming(recipe);

    // Update featured image
    this.populateRecipeImage(recipe);

    // Update ingredients
    this.populateRecipeIngredients(recipe);

    // Update instructions
    this.populateRecipeInstructions(recipe);

    // Update notes
    this.populateRecipeNotes(recipe);

    // Update tags
    this.populateRecipeTags(recipe);

    // Update share buttons
    this.populateShareButtons(recipe);

    // Generate schema markup
    this.generateRecipeSchema(recipe);
  }

  populateRecipeMeta(recipe) {
    const metaEl = document.getElementById('recipe-meta');
    let metaHTML = '';

    if (recipe.recipe_type) {
      metaHTML += `<span class="recipe-single__type">${recipe.recipe_type}</span>`;
    }

    if (recipe.difficulty) {
      metaHTML += `<span class="recipe-single__difficulty">${recipe.difficulty}</span>`;
    }

    if (recipe.servings > 0) {
      metaHTML += `<span class="recipe-single__servings">${this.translations.serves} ${recipe.servings}</span>`;
    }

    metaEl.innerHTML = metaHTML;
  }

  populateRecipeTiming(recipe) {
    const timingEl = document.getElementById('recipe-timing');
    let timingHTML = '';

    if (recipe.prep_time > 0) {
      timingHTML += `
        <div class="recipe-single__time">
          <strong>${this.translations.prep_time}</strong>
          <span>${recipe.prep_time}${this.translations.minutes_short}</span>
        </div>
      `;
    }

    if (recipe.cook_time > 0) {
      timingHTML += `
        <div class="recipe-single__time">
          <strong>${this.translations.cook_time}</strong>
          <span>${recipe.cook_time}${this.translations.minutes_short}</span>
        </div>
      `;
    }

    if (recipe.total_time > 0) {
      timingHTML += `
        <div class="recipe-single__time recipe-single__time--total">
          <strong>${this.translations.total_time}</strong>
          <span>${recipe.total_time}${this.translations.minutes_short}</span>
        </div>
      `;
    }

    timingEl.innerHTML = timingHTML;
  }

  populateRecipeImage(recipe) {
    const imageWrapper = document.getElementById('recipe-image-wrapper');

    if (recipe.featured_image && recipe.featured_image.url) {
      imageWrapper.innerHTML = `
        <div class="recipe-single__image media media--landscape">
          <img
            src="${recipe.featured_image.url}"
            alt="${recipe.featured_image.alt || recipe.title}"
            loading="eager"
            sizes="(min-width: 1200px) 800px, (min-width: 750px) calc(100vw - 20rem), calc(100vw - 3rem)"
          >
        </div>
      `;
      imageWrapper.style.display = 'block';
    } else {
      imageWrapper.style.display = 'none';
    }
  }

  populateRecipeIngredients(recipe) {
    const ingredientsSection = document.getElementById('recipe-ingredients-section');
    const ingredientsList = document.getElementById('recipe-ingredients-list');

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      let ingredientsHTML = '';

      recipe.ingredients.forEach((ingredient, index) => {
        let ingredientHTML = `
          <div class="recipe-ingredient" data-ingredient-order="${index + 1}">
            <div class="recipe-ingredient__content">
              <div class="recipe-ingredient__amount">${ingredient.amount || ''}</div>
              <div class="recipe-ingredient__name">
                ${ingredient.name}
                ${ingredient.notes ? `<span class="recipe-ingredient__notes">(${ingredient.notes})</span>` : ''}
              </div>
            </div>
        `;

        // Add shoppable product if available and enabled
        if (this.settings.show_shoppable_ingredients && ingredient.product && ingredient.product.id) {
          ingredientHTML += `
            <div class="recipe-ingredient__product">
              <a href="${ingredient.product.url}" class="recipe-ingredient__product-link">
                ${
                  ingredient.product.featured_image && ingredient.product.featured_image.url
                    ? `
                  <div class="recipe-ingredient__product-image">
                    <img
                      src="${ingredient.product.featured_image.url}"
                      alt="${ingredient.product.featured_image.alt || ingredient.product.title}"
                      loading="lazy"
                      width="60"
                      height="60"
                    >
                  </div>
                `
                    : ''
                }
                <div class="recipe-ingredient__product-info">
                  <span class="recipe-ingredient__product-title">${ingredient.product.title}</span>
                  <span class="recipe-ingredient__product-price">${this.formatPrice(ingredient.product.price)}</span>
                </div>
                <span class="recipe-ingredient__shop-btn">
                  ${this.translations.shop_ingredient}
                </span>
              </a>
            </div>
          `;
        }

        ingredientHTML += '</div>';
        ingredientsHTML += ingredientHTML;
      });

      ingredientsList.innerHTML = ingredientsHTML;
      ingredientsSection.style.display = 'block';
    } else {
      ingredientsSection.style.display = 'none';
    }
  }

  populateRecipeInstructions(recipe) {
    const instructionsSection = document.getElementById('recipe-instructions-section');
    const instructionsContent = document.getElementById('recipe-instructions-content');

    if (recipe.instructions) {
      instructionsContent.innerHTML = recipe.instructions;
      instructionsSection.style.display = 'block';
    } else {
      instructionsSection.style.display = 'none';
    }
  }

  populateRecipeNotes(recipe) {
    const notesSection = document.getElementById('recipe-notes-section');
    const notesContent = document.getElementById('recipe-notes-content');

    if (recipe.notes) {
      notesContent.innerHTML = recipe.notes;
      notesSection.style.display = 'block';
    } else {
      notesSection.style.display = 'none';
    }
  }

  populateRecipeTags(recipe) {
    const tagsSection = document.getElementById('recipe-tags-section');
    const tagsList = document.getElementById('recipe-tags-list');

    if (recipe.tags && recipe.tags.length > 0) {
      const tagsHTML = recipe.tags.map((tag) => `<span class="recipe-single__tag badge">${tag}</span>`).join('');

      tagsList.innerHTML = tagsHTML;
      tagsSection.style.display = 'block';
    } else {
      tagsSection.style.display = 'none';
    }
  }

  populateShareButtons(recipe) {
    const shareButtons = document.getElementById('recipe-share-buttons');
    const recipeUrl = `${this.settings.base_url}/pages/${this.settings.page_handle}/${recipe.slug}`;

    // Simple share buttons - you can enhance this
    shareButtons.innerHTML = `
      <button type="button" class="share-button" onclick="navigator.share ? navigator.share({title: '${
        recipe.title
      }', url: '${recipeUrl}'}) : window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      recipeUrl
    )}', '_blank')">
        Share Recipe
      </button>
    `;
  }

  generateRecipeSchema(recipe) {
    // Remove existing schema
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Generate new schema
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Recipe',
      name: recipe.title,
      description: recipe.description || recipe.title,
      url: `${this.settings.base_url}/pages/${this.settings.page_handle}/${recipe.slug}`,
      author: {
        '@type': 'Organization',
        name: document.title.split(' - ').pop() || 'Recipe Site',
      },
    };

    // Add image if available
    if (recipe.featured_image && recipe.featured_image.url) {
      schema.image = [recipe.featured_image.url];
    }

    // Add timing
    if (recipe.prep_time > 0) schema.prepTime = `PT${recipe.prep_time}M`;
    if (recipe.cook_time > 0) schema.cookTime = `PT${recipe.cook_time}M`;
    if (recipe.total_time > 0) schema.totalTime = `PT${recipe.total_time}M`;

    // Add servings
    if (recipe.servings > 0) schema.recipeYield = `${recipe.servings} servings`;

    // Add ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      schema.recipeIngredient = recipe.ingredients.map((ingredient) =>
        `${ingredient.amount || ''} ${ingredient.name}`.trim()
      );
    }

    // Add to page
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaScript);
  }

  updatePageMeta({ title, description, image, url }) {
    // Update page title
    if (title) {
      document.title = title;
    }

    // Update meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (description) {
      if (descMeta) {
        descMeta.setAttribute('content', description);
      } else {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        descMeta.setAttribute('content', description);
        document.head.appendChild(descMeta);
      }
    }

    // Update Open Graph tags
    this.updateMetaTag('og:title', title);
    this.updateMetaTag('og:description', description);
    this.updateMetaTag('og:url', url);
    if (image) {
      this.updateMetaTag('og:image', image);
    }
  }

  updateRecipeMeta(recipe) {
    const recipeUrl = `${this.settings.base_url}/pages/${this.settings.page_handle}/${recipe.slug}`;
    const description = recipe.description ? recipe.description.substring(0, 300) : recipe.title;

    this.updatePageMeta({
      title: `${recipe.title} - ${document.title.split(' - ').pop() || 'Recipes'}`,
      description: description,
      image: recipe.featured_image ? recipe.featured_image.url : null,
      url: recipeUrl,
    });
  }

  updateMetaTag(property, content) {
    if (!content) return;

    let meta = document.querySelector(`meta[property="${property}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  }

  // Filter and search functionality
  handleFilterClick(button) {
    const filterType = button.getAttribute('data-filter');
    const filterValue = button.getAttribute('data-value');

    // Update active button
    const filterGroup = button.parentElement;
    filterGroup.querySelectorAll('.recipes-listing__filter-button').forEach((btn) => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Apply filter
    this.applyFilters();
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.recipesData];

    // Apply category filter
    const activeCategoryBtn = document.querySelector('.recipes-listing__filter-button[data-filter="category"].active');
    if (activeCategoryBtn) {
      const categoryValue = activeCategoryBtn.getAttribute('data-value');
      if (categoryValue) {
        filtered = filtered.filter(
          (recipe) => recipe.recipe_type && recipe.recipe_type.toLowerCase().includes(categoryValue.toLowerCase())
        );
      }
    }

    // Apply flavor filter
    const activeFlavorBtn = document.querySelector('.recipes-listing__filter-button[data-filter="flavor"].active');
    if (activeFlavorBtn) {
      const flavorValue = activeFlavorBtn.getAttribute('data-value');
      if (flavorValue) {
        filtered = filtered.filter(
          (recipe) => recipe.tags && recipe.tags.some((tag) => tag.toLowerCase().includes(flavorValue.toLowerCase()))
        );
      }
    }

    // Apply search query
    if (this.searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(this.searchQuery) ||
          (recipe.description && recipe.description.toLowerCase().includes(this.searchQuery)) ||
          (recipe.tags && recipe.tags.some((tag) => tag.toLowerCase().includes(this.searchQuery)))
      );
    }

    this.filteredRecipes = filtered;
    this.currentPage = 1;
    this.displayRecipes();
  }

  displayRecipes() {
    const recipesPerPage = this.settings.recipes_per_page;
    const startIndex = 0;
    const endIndex = recipesPerPage;

    this.displayedRecipes = this.filteredRecipes.slice(startIndex, endIndex);

    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = this.renderRecipeCards(this.displayedRecipes);

    // Show/hide pagination
    const pagination = document.getElementById('recipe-pagination');
    if (pagination) {
      pagination.style.display = this.filteredRecipes.length > recipesPerPage ? 'block' : 'none';
    }
  }

  renderRecipeCards(recipes) {
    return recipes
      .map(
        (recipe, index) => `
      <div class="recipe-card-metaobject" data-recipe-id="${recipe.id}" data-categories="${recipe.recipe_type || ''}">
        <a href="/pages/${this.settings.page_handle}/${recipe.slug}" class="recipe-card-metaobject__link">
          <div class="recipe-card-metaobject__image-wrapper">
            ${
              recipe.featured_image && recipe.featured_image.url
                ? `
              <div class="recipe-card-metaobject__image">
                <img
                  src="${recipe.featured_image.url}"
                  alt="${recipe.featured_image.alt || recipe.title}"
                  loading="lazy"
                  sizes="(min-width: 1200px) 300px, (min-width: 750px) calc((100vw - 10rem) / 3), calc((100vw - 3rem) / 2)"
                >
              </div>
            `
                : `
              <div class="recipe-card-metaobject__image recipe-card-metaobject__image--placeholder">
                <svg><!-- placeholder icon --></svg>
              </div>
            `
            }
          </div>
          <div class="recipe-card-metaobject__content">
            <h3 class="recipe-card-metaobject__title h5">${recipe.title}</h3>
            ${
              recipe.recipe_type
                ? `
              <div class="recipe-card-metaobject__categories">
                <span class="recipe-card-metaobject__category">${recipe.recipe_type}</span>
              </div>
            `
                : ''
            }
            ${
              recipe.prep_time > 0
                ? `
              <div class="recipe-card-metaobject__meta">
                <span class="recipe-card-metaobject__time">
                  ${recipe.prep_time}${this.translations.minutes_short}
                </span>
              </div>
            `
                : ''
            }
          </div>
        </a>
      </div>
    `
      )
      .join('');
  }

  // Infinite scroll setup
  setupInfiniteScroll() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isLoading) {
            this.loadMoreRecipes();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    observer.observe(loadingIndicator);
  }

  loadMoreRecipes() {
    if (this.isLoading) return;

    const recipesPerPage = this.settings.recipes_per_page;
    const recipesPerLoad = this.settings.recipes_per_load;
    const currentlyDisplayed = this.displayedRecipes.length;
    const totalFiltered = this.filteredRecipes.length;

    if (currentlyDisplayed >= totalFiltered) return;

    this.isLoading = true;

    // Simulate loading delay
    setTimeout(() => {
      const nextRecipes = this.filteredRecipes.slice(currentlyDisplayed, currentlyDisplayed + recipesPerLoad);
      this.displayedRecipes = this.displayedRecipes.concat(nextRecipes);

      const grid = document.getElementById('recipe-grid');
      grid.innerHTML += this.renderRecipeCards(nextRecipes);

      // Hide pagination if all recipes are loaded
      if (this.displayedRecipes.length >= totalFiltered) {
        const pagination = document.getElementById('recipe-pagination');
        if (pagination) pagination.style.display = 'none';
      }

      this.isLoading = false;
    }, 300);
  }

  // Utility functions
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

  formatPrice(price) {
    // Simple price formatting - enhance based on your currency settings
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RecipeRouter();
});
