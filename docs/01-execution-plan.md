# Webshop Execution Plan

A step-by-step guide for planning and building a complete Xsolla-powered headless webshop. Use this document to scope work, identify dependencies, and track progress.

---

## Phase 0: Discovery & Requirements

Before writing code, gather requirements and assess readiness.

### Questions to Answer

#### Business Requirements
- [ ] What game/product is this webshop for?
- [ ] Target platforms (web, mobile web, in-game overlay)?
- [ ] Geographic regions and currencies needed?
- [ ] Expected launch date?
- [ ] Revenue targets or KPIs?

#### Catalog Requirements
- [ ] What item types will be sold? (currency, items, bundles, subscriptions, game keys)
- [ ] How many SKUs at launch?
- [ ] Will items have virtual currency pricing, real money, or both?
- [ ] Are there existing items in Xsolla, or starting fresh?
- [ ] What item groups/categories are needed?

#### Branding & Theming
- [ ] What is the game's name and genre?
- [ ] Describe the game's visual style (realistic, stylized, pixel art, anime, etc.)?
- [ ] What is the game's tone (serious/dark, lighthearted, competitive, casual)?
- [ ] Primary brand colors? (provide hex codes if available)
- [ ] Secondary/accent colors?
- [ ] Logo files available? (PNG with transparency, SVG preferred)
- [ ] Custom fonts used in the game or marketing?
- [ ] Existing style guide or brand book?
- [ ] Reference webshops or game stores the user likes?
- [ ] Any visual elements to avoid (competitor colors, certain imagery)?

#### User Experience Requirements
- [ ] Authenticated users only, or guest checkout?
- [ ] Existing authentication system to integrate with?
- [ ] Design mockups or Figma files available?

#### Technical Requirements
- [ ] Frontend framework preference (React, Vue, vanilla)?
- [ ] Backend language/framework?
- [ ] Hosting environment?
- [ ] Existing infrastructure to integrate with?

### Xsolla Account Checklist

| Item | Status | Notes |
|------|--------|-------|
| Publisher Account created | ☐ | |
| Project created | ☐ | Project ID: _______ |
| API key generated | ☐ | Stored securely |
| Webhook URL configured | ☐ | HTTPS required |
| Sandbox mode enabled | ☐ | For development |
| Login project configured | ☐ | Login Project ID (UUID): _______ |
| Server OAuth 2.0 client created | ☐ | Client ID: _______ |
| OAuth client secret saved | ☐ | Store in `.env` |

---

## Phase 1: Catalog Population

**Goal**: Ensure the Xsolla project has sufficient content to build and test the UI.

### 1.1 Audit Existing Catalog

```bash
# Check current state
xsolla catalog list-catalog-items --project-id YOUR_PROJECT_ID --json | jq '.items | length'
xsolla catalog list-catalog-currency --project-id YOUR_PROJECT_ID --json
xsolla catalog list-catalog-bundles --project-id YOUR_PROJECT_ID --json
```

### 1.2 Define Minimum Viable Catalog

| Content Type | Minimum Count | Purpose |
|--------------|---------------|---------|
| Virtual Currency | 1-2 | Premium + soft currency |
| Currency Packages | 4-6 | Tiered purchasing options |
| Virtual Items | 10+ | Variety for browsing |
| Bundles | 3-5 | Value offers |
| Item Groups | 3-5 | Navigation categories |

### 1.3 Create or Import Content

**Option A: Manual Creation**
- Use Publisher Account UI for complex items
- Use CLI for bulk operations
- See [Catalog Setup Guide](04-catalog-setup.md)

**Option B: Import from Existing Source**
- Export from game database
- Format as CSV
- Import via CLI: `xsolla catalog import-csv`

**Option C: Generate Test Data**
- Create placeholder items for UI development
- Replace with real content before launch

### 1.4 Asset Requirements

**Every item in the catalog needs visual assets.** Without images, the shop looks incomplete and unprofessional.

| Asset Type | Recommended Size | Format | Notes |
|------------|------------------|--------|-------|
| Item images | 512x512px | PNG/WebP | Transparent background preferred |
| Bundle images | 1024x512px | PNG/WebP | Show bundle contents or hero art |
| Currency icons | 128x128px | PNG/SVG | Used throughout UI |
| Currency package art | 512x512px | PNG/WebP | Stacks or piles of currency |
| Category icons | 64x64px | PNG/SVG | For navigation tabs |
| Hero banners | 1920x600px | PNG/JPG | Featured section backgrounds |

**Asset Delivery Options**:
1. **Hosted by client**: Provide public URLs (CDN recommended)
2. **Upload to Xsolla**: Use Publisher Account to upload images
3. **Generate placeholders**: Use placeholder images during development, replace before launch

### 1.5 Publish Items to Storefront

Items created via API are hidden by default. Publish them:

```bash
# Publish virtual items (requires name/description/prices)
xsolla catalog update-items --project-id YOUR_PROJECT_ID \
  --item-sku "item-sku" --sku "item-sku" \
  --name '{"en":"Item Name"}' --description '{"en":"Description"}' \
  --prices '[{"amount":0.99,"currency":"USD","is_default":true,"is_enabled":true}]' \
  --is-show-in-store

# Publish bundles and currency packages
xsolla catalog unhide-admin-bundle --project-id YOUR_PROJECT_ID --bundle-sku "bundle-sku"
```

### 1.6 Verify Catalog Quality

For each item, verify:
- [ ] Name is set (not empty)
- [ ] Description is meaningful
- [ ] **Image URL is valid and loads** (critical!)
- [ ] Price is configured (real and/or virtual)
- [ ] Assigned to at least one group
- [ ] `can_be_bought` is true
- [ ] **`is_show_in_store` is true** (required for cart functionality)

---

## Phase 2: Technical Setup

**Goal**: Establish development environment and project structure.

### 2.1 Project Initialization

```bash
# Create project structure
mkdir -p src/{server,client}
npm init -y

# Install dependencies
npm install express cors dotenv
npm install react react-dom
npm install -D typescript @types/node @types/react vite
```

### 2.2 Configuration Files

Create required configuration:

| File | Purpose |
|------|---------|
| `.xsolla.json` | Project/merchant IDs, environment config |
| `.env` | API key, secrets (gitignored) |
| `.env.example` | Template for team members |
| `.gitignore` | Exclude secrets, node_modules |

### 2.3 Backend API Structure

```
src/server/
├── index.ts          # Entry point, express setup
├── config.ts         # Load .xsolla.json and .env
├── xsolla-client.ts  # API wrapper for Xsolla endpoints
├── routes.ts         # REST endpoints for frontend
└── webhooks.ts       # Webhook handler with signature verification
```

### 2.4 Frontend Structure

```
src/client/
├── index.html
├── main.tsx
├── App.tsx
├── components/
│   ├── Catalog.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── ...
├── hooks/
│   ├── useShop.ts
│   └── useCheckout.ts
├── lib/
│   └── api.ts
└── types/
    └── xsolla.ts
```

---

## Phase 3: Branding & Theming

**Goal**: Establish visual identity that matches the game and appeals to its audience.

See [Branding & Theming Guide](03-branding-theming.md) for comprehensive details.

### 3.1 Gather Brand Assets

Collect from the user:
- [ ] Logo files (SVG preferred, PNG with transparency)
- [ ] Color palette (hex codes for primary, secondary, accent, backgrounds)
- [ ] Typography (font files or Google Font names)
- [ ] UI elements (buttons, icons, decorative elements from the game)
- [ ] Screenshots or concept art for reference

### 3.2 Create Theme Configuration

Define CSS variables or theme tokens:

```css
:root {
  /* Colors */
  --color-primary: #...;
  --color-secondary: #...;
  --color-accent: #...;
  --color-background: #...;
  --color-surface: #...;
  --color-text: #...;
  --color-text-muted: #...;
  
  /* Typography */
  --font-heading: 'GameFont', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing & Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

### 3.3 Theming Checklist

| Element | Branded | Notes |
|---------|---------|-------|
| Header/navigation | ☐ | Logo, game title |
| Buttons (primary) | ☐ | Brand color, hover states |
| Buttons (secondary) | ☐ | Outline or muted variant |
| Cards/containers | ☐ | Background, borders, shadows |
| Price displays | ☐ | Currency icons, sale colors |
| Badges (sale, new, popular) | ☐ | Eye-catching but on-brand |
| Loading states | ☐ | Spinner or skeleton matching theme |
| Empty states | ☐ | Friendly messaging, game-themed |
| Footer | ☐ | Legal links, support, branding |

### 3.4 Visual Style Patterns

Based on game genre, suggest appropriate patterns:

| Game Type | Style Suggestions |
|-----------|-------------------|
| Fantasy RPG | Ornate borders, parchment textures, gold accents |
| Sci-Fi | Neon accents, dark backgrounds, tech-inspired UI |
| Casual/Mobile | Bright colors, rounded corners, playful icons |
| Competitive | Clean lines, bold typography, team colors |
| Horror | Dark theme, red accents, distressed textures |

### 3.5 Review with User

- [ ] Present mockup or early build with theming applied
- [ ] Get feedback on colors, fonts, overall feel
- [ ] Iterate based on feedback
- [ ] Get sign-off before proceeding to full implementation

---

## Phase 4: Core Feature Implementation

**Goal**: Build minimum viable webshop functionality.

### 4.1 Implementation Order

Build features in this order to enable incremental testing:

| Priority | Feature | Depends On | Enables |
|----------|---------|------------|---------|
| 1 | Config/Auth setup | Xsolla credentials | Everything |
| 2 | Catalog display | Config | Browsing |
| 3 | Item detail view | Catalog | Add to cart |
| 4 | Cart management | Catalog | Checkout |
| 5 | Payment token generation | Cart | Purchases |
| 6 | Pay Station integration | Payment token | Transactions |
| 7 | Order status polling | Pay Station | Confirmation |
| 8 | Webhook handling | Server setup | Fulfillment |
| 9 | User inventory | Webhooks | Post-purchase |

### 4.2 Feature Checklist

#### Catalog & Browsing
- [ ] Fetch and display all items
- [ ] Group/category filtering
- [ ] Search functionality
- [ ] Sort options (price, name, newest)
- [ ] Handle items with missing data (name, image)
- [ ] Show both real-money and virtual-currency prices
- [ ] Loading states and error handling

#### Cart
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear cart
- [ ] Display cart total
- [ ] Persist cart across page refreshes
- [ ] Handle unauthenticated state gracefully
- [ ] Cart icon in navigation with item count badge
- [ ] Both "Add to Cart" and "Buy Now" options for items/bundles

#### Checkout & Payment
- [ ] Generate payment token (server-side)
- [ ] Open Pay Station (popup or redirect)
- [ ] Handle popup blockers
- [ ] Poll order status after payment
- [ ] Display success/failure states
- [ ] Clear cart on successful purchase

#### Webhooks & Fulfillment
- [ ] Verify webhook signatures
- [ ] Handle `user_validation` webhook
- [ ] Handle `order_paid` webhook
- [ ] Implement idempotency (don't double-grant)
- [ ] Handle `refund` webhook
- [ ] Log all webhook events

---

## Phase 5: Webshop Sections

**Goal**: Implement high-converting shop layout.

### 5.1 Section Implementation Order

See [Webshop Design Guide](06-webshop-design.md) and [Branding & Theming Guide](03-branding-theming.md) for detailed specs.

| Priority | Section | Complexity | Revenue Impact |
|----------|---------|------------|----------------|
| 1 | Currency Packages | Low | High |
| 2 | Featured/Hero | Medium | High |
| 3 | Item Catalog | Medium | Medium |
| 4 | Bundles | Low | High |
| 5 | Limited-Time Offers | Medium | High |
| 6 | Starter Bundles | Low | High (new users) |
| 7 | Offer Chains | High | Medium |

### 5.2 Section Checklist

#### Currency Section
- [ ] Display all currency packages
- [ ] Show bonus amounts on larger packs
- [ ] Highlight "Most Popular" and "Best Value"
- [ ] One-click purchase flow

#### Featured Section
- [ ] Hero banner with current best offer
- [ ] Countdown timer for limited offers
- [ ] Clear CTA button
- [ ] Mobile-responsive layout

#### Items Section
- [ ] Grid layout with filtering
- [ ] Category tabs
- [ ] Virtual currency purchase option
- [ ] "Insufficient funds" handling with upsell

#### Bundles Section
- [ ] Show bundle contents
- [ ] Display value breakdown
- [ ] Show savings percentage
- [ ] One-time purchase badges for starter bundles

---

## Phase 6: Polish & Optimization

**Goal**: Production-ready quality and performance.

### 6.1 UI/UX Polish

- [ ] Loading skeletons instead of spinners
- [ ] Optimistic UI updates
- [ ] Success/error toast notifications
- [ ] Smooth animations and transitions
- [ ] Empty states with CTAs
- [ ] Mobile touch optimization

### 6.2 Performance

- [ ] Image lazy loading
- [ ] API response caching
- [ ] Bundle size optimization
- [ ] Lighthouse score > 90

### 6.3 Error Handling

- [ ] Network failure recovery
- [ ] API error messages user-friendly
- [ ] Retry logic for transient failures
- [ ] Offline indicator

### 6.4 Analytics Integration

- [ ] Page view tracking
- [ ] Add to cart events
- [ ] Purchase funnel tracking
- [ ] Revenue attribution

---

## Phase 7: Testing

**Goal**: Verify all flows work correctly.

### 7.1 Sandbox Testing

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Browse catalog | Items display with prices | ☐ |
| Filter by category | Correct items shown | ☐ |
| Add to cart | Cart updates, badge shows count | ☐ |
| Update quantity | Total recalculates | ☐ |
| Remove from cart | Item removed, total updates | ☐ |
| Checkout with test card | Pay Station opens | ☐ |
| Complete payment | Order marked done | ☐ |
| Webhook received | Server logs order_paid | ☐ |
| Inventory updated | Purchased items appear | ☐ |
| Duplicate webhook | Items not double-granted | ☐ |

### 7.2 Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 0077 | 3D Secure |

### 7.3 Edge Cases

- [ ] Empty catalog handling
- [ ] Item out of stock
- [ ] Price change during checkout
- [ ] Network timeout during payment
- [ ] User closes Pay Station without paying
- [ ] Webhook delivery failure and retry

---

## Phase 8: Launch Preparation

**Goal**: Ready for production traffic.

### 8.1 Production Configuration

- [ ] Switch from sandbox to production
- [ ] Update API keys to production keys
- [ ] Configure production webhook URL
- [ ] Set up monitoring and alerting
- [ ] Configure CDN for static assets

### 8.2 Security Review

- [ ] API keys not exposed in frontend
- [ ] Webhook signatures verified
- [ ] HTTPS everywhere
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured

### 8.3 Launch Checklist

- [ ] All test cases passing
- [ ] Production catalog populated
- [ ] Webhook endpoint responding
- [ ] Monitoring dashboards ready
- [ ] Rollback plan documented
- [ ] Support team briefed

---

## Execution Timeline Template

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Discovery + Branding | Requirements doc, brand assets collected, theme defined |
| 2 | Technical Setup + Catalog | Project scaffolding, catalog populated with assets |
| 3 | Core Features | Catalog display, cart, checkout working |
| 4 | Webshop Sections | Currency, featured, bundles with branding applied |
| 5 | Polish + Testing | All edge cases handled, sandbox tested |
| 6 | Launch Prep | Production config, security review |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing/late brand assets | Webshop looks generic, delays | Request assets in Phase 0, use placeholders |
| Missing item images | Unprofessional appearance | Block catalog items without images from UI |
| Empty/incomplete catalog | Can't test UI | Use placeholder data early |
| Webhook delivery issues | Orders not fulfilled | Implement retry + manual tools |
| Pay Station popup blocked | Users can't pay | Provide fallback redirect link |
| API rate limiting | Degraded experience | Cache catalog, implement backoff |
| Launch delay | Revenue impact | Prioritize MVP features |

---

## Success Metrics

Track these post-launch:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Conversion rate | >3% | Purchases / Visitors |
| Cart abandonment | <70% | Abandoned / Started |
| Average order value | $X | Revenue / Orders |
| Time to purchase | <5 min | First visit to payment |
| Error rate | <1% | Failed / Attempted purchases |
