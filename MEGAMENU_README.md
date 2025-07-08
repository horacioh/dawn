# Custom Megamenu System - Visual Menu-Driven Implementation

## 🎯 Overview

The custom megamenu system has been updated to be **menu-driven with visual image cards**, giving admin users full control over which menu items get the megamenu treatment through the Shopify admin panel. Navigation items now display as beautiful image cards with featured images.

## 🔧 How It Works

### Menu-Based Triggering
- **Menu items WITH submenu items** → Display as enhanced megamenus with image cards
- **Menu items WITHOUT submenu items** → Display as regular navigation links
- **Multiple megamenus** → Each menu item with children gets its own megamenu
- **Admin controlled** → Completely customizable through Navigation settings
- **Visual navigation** → Navigation items display as image cards with descriptions

### Desktop Megamenu Layout
```
[Menu Item with Submenu] (hover trigger)
└── Full-Width Megamenu Dropdown (slides down from top)
    ├── Navigation Section (left) - Image Cards
    │   ├── [Category 1 Image Card]
    │   │   ├── Subcategory A
    │   │   └── Subcategory B
    │   └── [Category 2 Image Card]
    │       ├── Subcategory C
    │       └── Subcategory D
    └── Featured Products (right, optional)
        ├── Product 1
        ├── Product 2
        └── "View All" link
```

### Mobile Implementation
- Full-screen overlay with product carousel
- Navigation menu with submenu support
- Auto-scrolling product carousel
- Touch/swipe gesture support

## 🛠 Admin Setup Instructions

### 1. Enable the Megamenu
1. Go to **Theme Settings** → **Custom Megamenu**
2. Check **"Enable Custom Megamenu"**
3. Optionally select a **"Featured Products Collection"**

### 2. Configure Navigation Menu
1. Go to **Online Store** → **Navigation**
2. Select your main menu (usually "Main menu")
3. Add menu items with submenu items:

**Example Structure:**
```
Main Menu
├── Home (no submenu - displays normally)
├── Shop (has submenu - displays as megamenu)
│   ├── All Products
│   ├── New Arrivals
│   ├── Sale Items
│   └── Collections
│       ├── Collection A
│       └── Collection B
├── About (no submenu - displays normally)
└── Contact (no submenu - displays normally)
```

### 3. Configure Featured Images for Navigation Items

The system supports beautiful image cards for navigation items. Here's how images are selected:

#### Image Priority (in order):
1. **Custom featured image** from metafield `menu.featured_image`
2. **Default object image** (product featured image, collection image, etc.)
3. **Placeholder icon** if no image available

#### Setting up Metafields:

**For Products:**
- **Namespace:** `menu`
- **Key:** `featured_image` (File/Image) - Custom menu image
- **Key:** `show_new_badge` (Boolean) - Display NEW! badge

**For Pages:**
- **Namespace:** `menu`
- **Key:** `featured_image` (File/Image) - Custom menu image

**For Collections:**
- **Namespace:** `menu`
- **Key:** `featured_image` (File/Image) - Custom menu image

#### How to Add Metafields:
1. Go to **Settings** → **Metafields**
2. Select **Products**, **Pages**, or **Collections**
3. Add definition:
   - **Namespace:** `menu`
   - **Key:** `featured_image`
   - **Type:** `File` (Image)
   - **Name:** `Menu Featured Image`

#### Supported Link Types:
- **Products** → Shows product image or custom menu image
- **Collections** → Shows collection image or custom menu image
- **Pages** → Shows custom menu image or placeholder
- **External URLs** → Shows placeholder icon

## 🎨 Visual Design Features

### Image Card Navigation
- **Beautiful image cards** for each navigation item
- **Hover animations** with subtle image scaling and card elevation
- **Automatic fallbacks** from custom images to default images to placeholders
- **Descriptions** pulled from product/page/collection content
- **Visual hierarchy** with clear titles and subtle descriptions
- **Responsive images** with optimized sizes for different screen sizes

### Card Interactions
- **Smooth hover effects** with elevation and border highlights
- **Image scaling** on hover for engaging visual feedback
- **Active state styling** for current page navigation
- **Sublevel navigation** with bullet points for hierarchical structure

## 📱 Responsive Behavior

### Desktop (750px+)
- **Full-width megamenus** that slide down from the top of the page
- **Backdrop overlay** prevents interaction with page content
- **Smooth slide animations** with cubic-bezier easing
- Hover-triggered megamenus with image cards
- Side-by-side navigation and products layout
- Keyboard navigation support and accessibility features
- Large image cards (140px height) with full descriptions
- **Centered layout** with max-width container (1200px)

### Tablet (750px-990px)
- Smaller image cards (120px height)
- Responsive grid layout
- Touch-friendly interactions
- Adjusted padding and spacing

### Mobile (749px and below)
- Hamburger menu triggers full-screen overlay
- Product carousel at top
- Compact image cards (80px height)
- Touch gestures and auto-scroll
- Optimized text sizes and spacing

## 🎨 Customization Options

### Theme Settings
- **Enable/Disable** megamenu system
- **Collection Selection** for featured products
- **Carousel Speed** for mobile auto-scroll (2-10 seconds)

### Menu Structure Flexibility
- Any menu item can have a megamenu (if it has submenu items)
- Support for 2-level navigation (Category → Subcategory)
- Mix of megamenu and regular menu items
- Completely admin-controlled structure

## 🔧 Technical Features

### Performance
- Multiple megamenu support with optimized JavaScript
- Lazy loading for product images
- Efficient hover event handling
- Clean CSS with CSS custom properties

### Accessibility
- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- Focus management
- ARIA attributes and labels

### Developer-Friendly
- Modular file structure
- Clean separation of concerns
- Comprehensive commenting
- Theme color integration

## 📁 File Structure

```
assets/
├── megamenu.css                    # Complete styling system
├── megamenu.js                     # Desktop + mobile functionality
└── megamenu-carousel.js            # Infinite scroll carousel

snippets/
├── header-custom-megamenu.liquid   # Menu-driven navigation
├── megamenu-product-item.liquid    # Product display component
└── mobile-carousel-product.liquid  # Mobile carousel wrapper

sections/
└── header.liquid                   # Integration point

config/
└── settings_schema.json            # Admin settings
```

## 🚀 Quick Start Example

1. **Enable** megamenu in Theme Settings
2. **Create** a menu structure like:
   ```
   Shop
   ├── All Products (link to /collections/all)
   ├── Categories (link to /collections)
   │   ├── Electronics (link to /collections/electronics)
   │   └── Clothing (link to /collections/clothing)
   └── Sale (link to /collections/sale)
   ```
3. **Add featured images** (optional):
   - Go to **Products** → **Electronics Collection** → **Metafields**
   - Add `menu.featured_image` with a beautiful category image
   - Repeat for other collections/products
4. **Select** a featured collection (optional)
5. **Save** and test!

The "Shop" menu item will now display as an enhanced megamenu with:
- **Beautiful image cards** for "All Products", "Categories", and "Sale"
- **Automatic fallbacks** to collection featured images if no custom metafield images
- **Sublevel navigation** for Electronics and Clothing under Categories
- **Optional featured products** on the right side

### Result:
```
Shop (hover) → Full-width megamenu slides down from top ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ [Backdrop Overlay with Full-Width Megamenu]                                │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐     │
│    │ [All Products Image]  [Categories Image]  [Sale Image]         │     │
│    │ All Products          Categories          Sale                 │     │
│    │ Browse our entire...  Shop by category... Limited time...     │     │
│    │                       • Electronics                           │     │
│    │                       • Clothing                              │     │
│    │                                                               │     │
│    │ [Optional: Featured Products carousel on the right] ────────→ │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│ [Page content dimmed/blocked by backdrop]                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 💡 Best Practices

### Navigation Structure
- Keep submenu structure logical and not too deep (2 levels max)
- Use descriptive menu item names that work well as card titles
- Ensure menu items have proper URLs that link to relevant pages
- Consider menu item order for best UX and visual flow

### Image Management
- **Use high-quality images** (at least 300px wide) for best results
- **Maintain consistent aspect ratios** across navigation images
- **Optimize image file sizes** to ensure fast loading
- **Add alt text** through product/collection descriptions
- **Test fallback scenarios** when images aren't available

### Content Strategy
- **Write compelling descriptions** for products/collections (they show in cards)
- **Keep descriptions concise** (60 characters max for best display)
- **Use relevant keywords** in titles and descriptions
- **Update featured images seasonally** to keep navigation fresh

### Technical Considerations
- **Test on all devices** (desktop, tablet, mobile)
- **Verify hover interactions** work smoothly
- **Check loading performance** with multiple images
- **Ensure accessibility** with proper alt text and keyboard navigation
- **Monitor Core Web Vitals** with the additional image loading

### SEO Benefits
- **Enhanced visual navigation** improves user engagement
- **Better click-through rates** with appealing image cards
- **Improved site architecture** with clear visual hierarchy
- **Reduced bounce rates** through engaging navigation experience

---

*This system gives you complete control over your navigation while providing an enhanced user experience through beautiful, functional megamenus with engaging visual elements.* 