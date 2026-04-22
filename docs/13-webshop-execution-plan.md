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

#### User Experience Requirements
- [ ] Authenticated users only, or guest checkout?
- [ ] Existing authentication system to integrate with?
- [ ] Design mockups or Figma files available?
- [ ] Branding guidelines (colors, fonts, logos)?

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
| Login project configured | ☐ | If using Xsolla auth |

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
- See [Catalog Setup Guide](11-catalog-setup.md)

**Option B: Import from Existing Source**
- Export from game database
- Format as CSV
- Import via CLI: `xsolla catalog import-csv`

**Option C: Generate Test Data**
- Create placeholder items for UI development
- Replace with real content before launch

### 1.4 Verify Catalog Quality

For each item, verify:
- [ ] Name is set (not empty)
- [ ] Description is meaningful
- [ ] Image URL is valid and loads
- [ ] Price is configured (real and/or virtual)
- [ ] Assigned to at least one group
- [ ] `can_be_bought` is true

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

## Phase 3: Core Feature Implementation

**Goal**: Build minimum viable webshop functionality.

### 3.1 Implementation Order

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

### 3.2 Feature Checklist

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

## Phase 4: Webshop Sections

**Goal**: Implement high-converting shop layout.

### 4.1 Section Implementation Order

See [Webshop Design Guide](12-webshop-design.md) for detailed specs.

| Priority | Section | Complexity | Revenue Impact |
|----------|---------|------------|----------------|
| 1 | Currency Packages | Low | High |
| 2 | Featured/Hero | Medium | High |
| 3 | Item Catalog | Medium | Medium |
| 4 | Bundles | Low | High |
| 5 | Limited-Time Offers | Medium | High |
| 6 | Starter Bundles | Low | High (new users) |
| 7 | Offer Chains | High | Medium |

### 4.2 Section Checklist

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

## Phase 5: Polish & Optimization

**Goal**: Production-ready quality and performance.

### 5.1 UI/UX Polish

- [ ] Loading skeletons instead of spinners
- [ ] Optimistic UI updates
- [ ] Success/error toast notifications
- [ ] Smooth animations and transitions
- [ ] Empty states with CTAs
- [ ] Mobile touch optimization

### 5.2 Performance

- [ ] Image lazy loading
- [ ] API response caching
- [ ] Bundle size optimization
- [ ] Lighthouse score > 90

### 5.3 Error Handling

- [ ] Network failure recovery
- [ ] API error messages user-friendly
- [ ] Retry logic for transient failures
- [ ] Offline indicator

### 5.4 Analytics Integration

- [ ] Page view tracking
- [ ] Add to cart events
- [ ] Purchase funnel tracking
- [ ] Revenue attribution

---

## Phase 6: Testing

**Goal**: Verify all flows work correctly.

### 6.1 Sandbox Testing

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

### 6.2 Test Cards

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 0077 | 3D Secure |

### 6.3 Edge Cases

- [ ] Empty catalog handling
- [ ] Item out of stock
- [ ] Price change during checkout
- [ ] Network timeout during payment
- [ ] User closes Pay Station without paying
- [ ] Webhook delivery failure and retry

---

## Phase 7: Launch Preparation

**Goal**: Ready for production traffic.

### 7.1 Production Configuration

- [ ] Switch from sandbox to production
- [ ] Update API keys to production keys
- [ ] Configure production webhook URL
- [ ] Set up monitoring and alerting
- [ ] Configure CDN for static assets

### 7.2 Security Review

- [ ] API keys not exposed in frontend
- [ ] Webhook signatures verified
- [ ] HTTPS everywhere
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured

### 7.3 Launch Checklist

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
| 1 | Discovery + Setup | Requirements doc, project scaffolding |
| 2 | Catalog + Core API | Populated catalog, backend API complete |
| 3 | Frontend Core | Catalog, cart, checkout working |
| 4 | Sections | Currency, featured, bundles implemented |
| 5 | Polish + Testing | All edge cases handled, sandbox tested |
| 6 | Launch Prep | Production config, security review |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
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
