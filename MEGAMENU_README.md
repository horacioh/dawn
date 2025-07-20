# Custom Megamenu System - Clean & Minimal Design

## 🎯 Overview

The custom megamenu system features a **clean, minimal design inspired by Spindrift's professional aesthetic**. This menu-driven system gives admin users full control over navigation structure while maintaining a sophisticated, organized appearance that prioritizes content and usability.

## 🔧 How It Works

### Menu-Based Triggering
- **Menu items WITH submenu items** → Display as clean, organized megamenus
- **Menu items WITHOUT submenu items** → Display as regular navigation links
- **Multiple megamenus** → Each menu item with children gets its own megamenu
- **Admin controlled** → Completely customizable through Navigation settings
- **Text-focused** → Clean typography prioritizes readability and organization

### Desktop Megamenu Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Header/Main Menu - Always Visible]                        │
│ Home | Shop ← [hover trigger] | About | Contact           │
└─────────────────────────────────────────────────────────────┘
       ↓ Clean megamenu expands below header
┌─────────────────────────────────────────────────────────────┐
│ Clean Full-Width Megamenu (subtle slide down)              │
├─────────────────────────────────────────────────────────────┤
│ Navigation Section (left) - Clean Text Links               │
│   ├── Category 1                                           │
│   │   ├── • Subcategory A                                  │
│   │   └── • Subcategory B                                  │
│   ├── Category 2                                           │
│   │   ├── • Subcategory C                                  │
│   │   └── • Subcategory D                                  │
│                                                             │
│ Featured Products (right, optional)                        │
│   ├── [small img] Product 1 - $29.99                       │
│   ├── [small img] Product 2 - $19.99                       │
│   └── "View All" link                                      │
└─────────────────────────────────────────────────────────────┘
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
- **Clean header expansion** - megamenus slide down subtly from below main menu
- **Main menu remains visible** and interactive at all times
- **Minimal backdrop overlay** - very subtle dimming without blocking header
- **Smooth, fast animations** - professional 200ms transitions
- Clean text-based navigation with organized hierarchy
- Side-by-side navigation and optional featured products layout
- Keyboard navigation support and accessibility features
- **Typography-focused design** - excellent readability and spacing
- **Centered layout** with max-width container (1200px)
- **Scrolling allowed** - users can scroll page while megamenu is open

### Tablet (750px-990px)
- Smaller image cards (120px height)
- Responsive grid layout
- Touch-friendly interactions
- Adjusted padding and spacing

### Mobile (749px and below)
- **Clean hamburger menu** - triggers professional full-screen overlay
- **Disabled default drawer** - custom system overrides Shopify's built-in drawer
- **Minimal product carousel** at top with small, clean product cards
- **Organized navigation** with clear hierarchy and spacing
- Touch-friendly interactions with subtle hover states
- Click outside to close functionality
- **Optimized typography** and consistent spacing throughout

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
└── mobile-carousel-product.liquid  # Mobile carousel product cards

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
Shop (hover) → Header expands downward ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│ [Header - Always Visible & Interactive]                                    │
│ Home | Shop ← (hovered) | About | Contact | Search | Cart                  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Full-Width Megamenu - Slides down from header]                            │
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
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Page content - Slightly dimmed but scrollable]                            │
│ • Header remains interactive                                                │
│ • Users can scroll while megamenu is open                                  │
│ • Click outside megamenu to close                                          │
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