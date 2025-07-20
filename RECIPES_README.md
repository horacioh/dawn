# Recipes Listing Section

This section provides a beautiful, filterable recipes listing similar to the Spindrift website, with category filters, flavor filters, and load more functionality.

## Features

- **Hero Section**: Customizable title, description, and image
- **Category Filters**: Filter recipes by categories (Cocktail, Mocktail, Food, etc.)
- **Flavor Filters**: Dropdown to filter by flavors (Lemon, Lime, etc.)
- **Responsive Grid**: Beautiful recipe cards in a responsive grid layout
- **Load More**: Ajax-powered load more button or standard pagination
- **Animations**: Smooth scroll animations and hover effects
- **Customizable**: Extensive admin settings for layout, colors, and content

## Setup Instructions

### 1. Create a Blog for Recipes

1. Go to Shopify Admin > Online Store > Blog posts
2. Create a new blog called "Recipes" (handle: `recipes`)
3. Add your recipe articles to this blog

### 2. Tag Your Articles

Use tags to enable filtering functionality:

**Category Tags** (for main filters):
- `cocktail` - for cocktail recipes
- `mocktail` - for mocktail recipes  
- `food` - for food recipes

**Flavor Tags** (for dropdown filter):
- `lemon` - for lemon-flavored recipes
- `lime` - for lime-flavored recipes
- `grapefruit` - for grapefruit-flavored recipes
- `orange` - for orange-flavored recipes
- Add more flavor tags as needed

### 3. Set Up the Page

1. Create a new page in Shopify Admin with handle `recipes` or use the existing `recetas` page
2. The section will automatically use the `page.recetas.json` template
3. The section is already configured with example filters

### 4. Customize the Section

In the Shopify theme editor:

1. Navigate to your recipes page
2. Select the "Recipes Listing" section
3. Customize the settings:

#### Hero Section
- **Show hero section**: Toggle hero on/off
- **Hero title**: Page title (e.g., "Cocktails & More")
- **Heading size**: Choose from h2 to hxxl
- **Hero description**: Rich text description
- **Hero image**: Optional header image

#### Filters
- **Show category filters**: Enable/disable category buttons
- **Show flavor filter dropdown**: Enable/disable flavor dropdown

#### Grid Settings
- **Recipes per page**: 6-24 recipes per page
- **Image height**: Small, Medium, Large, or Adapt
- **Image aspect ratio**: Square, Portrait, Landscape, or Adapt
- **Show recipe excerpt**: Display article excerpts
- **Show publish date**: Display publication dates
- **Show recipe tags**: Display article tags

#### Pagination
- **Pagination type**: "Load more button" or "Standard pagination"

### 5. Add Filter Blocks

You can customize the category and flavor filters:

#### Category Filter Blocks
- **Category name**: Display name (e.g., "Cocktail")
- **Category tag**: Article tag to match (e.g., "cocktail")

#### Flavor Filter Blocks
- **Flavor name**: Display name (e.g., "Lemon")
- **Flavor tag**: Article tag to match (e.g., "lemon")

## File Structure

The recipes section includes these files:

```
sections/
  recipes-listing.liquid       # Main section template
snippets/
  recipe-card.liquid          # Recipe card component
assets/
  section-recipes-listing.css # Styles for the section
  recipes-listing.js          # JavaScript functionality
templates/
  page.recetas.json          # Page template configuration
locales/
  en.default.json           # Translation strings (updated)
```

## Styling Customization

The CSS uses CSS custom properties for theming:

```css
/* Main colors from your theme */
--color-foreground  /* Text color */
--color-background  /* Background color */

/* Custom properties for spacing */
--animation-order   /* Animation cascade order */
```

### Key CSS Classes

- `.recipes-listing` - Main container
- `.recipes-hero` - Hero section
- `.recipes-filters` - Filter controls
- `.recipes-grid` - Recipe grid
- `.recipe-card` - Individual recipe cards

## JavaScript Functionality

The JavaScript handles:

- **Category filtering**: Click category buttons to filter
- **Flavor filtering**: Select from flavor dropdown
- **Load more**: Ajax loading of additional recipes
- **Animations**: Scroll-triggered animations
- **Responsive behavior**: Mobile-optimized interactions

### Browser Support

- Modern browsers (Chrome 88+, Firefox 85+, Safari 14+)
- Mobile browsers (iOS 14+, Android 88+)
- Graceful degradation for older browsers

## SEO & Accessibility

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt text**: Images include descriptive alt text
- **Focus management**: Keyboard navigation support
- **Screen readers**: ARIA labels and descriptions
- **Loading states**: Visual feedback during Ajax operations

## Troubleshooting

### Common Issues

1. **Recipes not showing**
   - Check that the blog handle is set to "recipes"
   - Ensure articles are published in the correct blog

2. **Filters not working**
   - Verify tags are correctly applied to articles
   - Check that tag names match filter settings
   - Tags should be lowercase and hyphenated

3. **Load more not working**
   - Check browser console for JavaScript errors
   - Ensure pagination is enabled in blog settings
   - Verify articles per page setting

4. **Styling issues**
   - Check that CSS file is loading correctly
   - Verify CSS custom properties are defined in theme
   - Test responsive breakpoints

### Tag Format Examples

**Correct tag format**:
- `cocktail` ✓
- `lemon` ✓
- `lime` ✓

**Incorrect tag format**:
- `Cocktail` ✗ (capitalized)
- `lemon-flavor` ✗ (use just "lemon")
- `lime juice` ✗ (spaces, use "lime")

## Advanced Customization

### Custom Animations

Animations use the existing theme animation system. To customize:

```css
.recipes-grid__item {
  --animation-delay: calc(var(--animation-order) * 0.1s);
}
```

### Custom Filters

To add new filter types, modify the section schema and add corresponding JavaScript:

1. Add new block type in `sections/recipes-listing.liquid`
2. Update filter logic in `assets/recipes-listing.js`
3. Add corresponding CSS styles

### API Integration

The load more functionality uses Shopify's built-in pagination. For custom API integrations:

1. Modify the `loadMoreRecipes()` function
2. Update URL handling in JavaScript
3. Ensure proper error handling

## Support

For issues or customization help:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test with different article configurations
4. Review Shopify theme requirements

---

## Example Article Setup

Here's how to set up a sample recipe article:

**Title**: "Sparkling Lemon Lime Margarita"

**Tags**: `cocktail`, `lemon`, `lime`, `tequila`

**Excerpt**: "The perfect summer margarita recipe with fresh-squeezed lime juice and sparkling water."

**Featured Image**: High-quality photo of the finished drink

**Content**: Full recipe with ingredients and instructions

This setup will make the article appear when filtering by "Cocktail" category and when selecting "Lemon" or "Lime" from the flavors dropdown. 