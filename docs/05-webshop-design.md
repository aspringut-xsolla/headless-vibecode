# Webshop Design: High-Converting Store Layout

Design principles and section patterns for building webshops that maximize player engagement and revenue.

## Core Design Principles

### 1. Value Clarity
Players should immediately understand what they're getting and why it's worth the price.

### 2. Urgency & Scarcity
Limited-time offers and exclusive items drive faster purchasing decisions.

### 3. Progressive Disclosure
Show the most compelling offers first, reveal depth as players explore.

### 4. Trust Signals
Clear pricing, no hidden fees, easy refund visibility builds confidence.

---

## Recommended Section Order

The optimal webshop layout guides players from high-value offers to exploration:

```
┌─────────────────────────────────────────┐
│  1. FEATURED / HERO SECTION             │  ← First impression, best offer
├─────────────────────────────────────────┤
│  2. LIMITED-TIME OFFERS                 │  ← Urgency drivers
├─────────────────────────────────────────┤
│  3. STARTER / FIRST PURCHASE BUNDLES    │  ← New player conversion
├─────────────────────────────────────────┤
│  4. CURRENCY PACKAGES                   │  ← Core monetization
├─────────────────────────────────────────┤
│  5. OFFER CHAINS / PROGRESSION DEALS    │  ← Retention mechanics
├─────────────────────────────────────────┤
│  6. ITEM CATALOG                        │  ← Browse & discover
├─────────────────────────────────────────┤
│  7. BUNDLES                             │  ← Value seekers
└─────────────────────────────────────────┘
```

---

## Section 1: Featured / Hero Section

**Purpose**: Capture attention, showcase best current offer.

### Design Elements
- Full-width banner with striking visual
- Single, clear call-to-action
- Price with crossed-out original (if discounted)
- Countdown timer for limited offers

### Content Strategy
```
┌────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════╗  │
│  ║  [HERO IMAGE: Character with Featured Item]      ║  │
│  ║                                                  ║  │
│  ║  SHADOW KNIGHT COLLECTION                        ║  │
│  ║  Exclusive armor set + 1000 Gems                 ║  │
│  ║                                                  ║  │
│  ║  $̶2̶9̶.̶9̶9̶  $14.99  [BUY NOW]                      ║  │
│  ║                                                  ║  │
│  ║  ⏱ Ends in: 2d 14h 23m                          ║  │
│  ╚══════════════════════════════════════════════════╝  │
└────────────────────────────────────────────────────────┘
```

### Implementation
```typescript
interface FeaturedOffer {
  sku: string;
  title: string;
  subtitle: string;
  heroImage: string;
  price: Price;
  originalPrice?: Price;
  endsAt?: Date;
  cta: string;
}

// Fetch from a "featured" group or specific SKU list
const featured = await api.getItemsByGroup('featured');
```

---

## Section 2: Limited-Time Offers

**Purpose**: Create urgency, drive immediate purchases.

### Design Elements
- Countdown timers on each offer
- "X left" stock indicators
- Flash sale badges
- Horizontal scrollable row

### Content Patterns

| Offer Type | Discount | Duration | Purchase Limit |
|------------|----------|----------|----------------|
| Flash Sale | 50-70% | 24 hours | 1 per user |
| Weekend Deal | 30-50% | 48 hours | 3 per user |
| Weekly Special | 20-30% | 7 days | Unlimited |

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  ⚡ LIMITED TIME                              See All →      │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ FLASH SALE  │  │ WEEKEND     │  │ DAILY DEAL  │          │
│  │ [Image]     │  │ [Image]     │  │ [Image]     │          │
│  │ 500 Gems    │  │ Battle Pack │  │ XP Boost x5 │          │
│  │ $̶4̶.̶9̶9̶ $1.99 │  │ $̶1̶4̶.̶9̶9̶ $7.99│  │ $̶5̶.̶9̶9̶ $2.99 │          │
│  │ ⏱ 5h 23m   │  │ ⏱ 1d 12h   │  │ ⏱ 18h 45m  │          │
│  │ [BUY]       │  │ [BUY]       │  │ [BUY]       │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## Section 3: Starter / First Purchase Bundles

**Purpose**: Convert free players to paying customers.

### Psychology
- Extreme value perception (80%+ "savings")
- One-time purchase creates commitment
- Low price point reduces friction

### Design Elements
- "One Time Only" badge
- Value breakdown showing individual item prices
- Progress indicator if multi-tier

### Tiered Starter Offers
```
┌─────────────────────────────────────────────────────────────┐
│  🎁 NEW PLAYER SPECIALS (One-time purchase)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ⭐ STARTER BUNDLE                     [BEST VALUE]   │  │
│  │                                                       │  │
│  │  ✓ 500 Gems ($4.99 value)                            │  │
│  │  ✓ 5,000 Gold ($2.99 value)                          │  │
│  │  ✓ 10x Health Potions ($4.99 value)                  │  │
│  │  ✓ Exclusive "Founder" Title                         │  │
│  │                                                       │  │
│  │  Total Value: $12.97                                  │  │
│  │  Your Price:  $4.99  (62% OFF!)                       │  │
│  │                                                       │  │
│  │  [CLAIM NOW]                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ ADVENTURE PACK  │  │ WARRIOR PACK    │                   │
│  │ $0.99           │  │ $9.99           │                   │
│  │ 100 Gems + Skin │  │ Full Armor Set  │                   │
│  │ [BUY]           │  │ [BUY]           │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 4: Currency Packages

**Purpose**: Core monetization, establish virtual economy.

### Design Principles
- Always show 4-6 tiers
- Highlight "Most Popular" (usually middle tier)
- Show bonus percentages on larger packs
- Include "Best Value" on highest tier

### Optimal Pricing Tiers

| Tier | Price | Base Amount | Bonus | Total | Per-Dollar Value |
|------|-------|-------------|-------|-------|------------------|
| Tiny | $0.99 | 100 | 0% | 100 | 101 |
| Small | $4.99 | 500 | 10% | 550 | 110 |
| Medium | $9.99 | 1000 | 20% | 1200 | 120 |
| Large | $19.99 | 2000 | 30% | 2600 | 130 |
| Huge | $49.99 | 5000 | 40% | 7000 | 140 |
| Mega | $99.99 | 10000 | 50% | 15000 | 150 |

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  💎 GEMS                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────┐  ┌─────┐  ┌─────────┐  ┌─────┐  ┌─────────────┐  │
│   │ 💎  │  │ 💎💎 │  │ ⭐ 💎💎💎│  │💎💎💎│  │  💎💎💎💎💎 │  │
│   │     │  │     │  │  MOST   │  │💎💎💎│  │  BEST VALUE │  │
│   │ 100 │  │ 550 │  │ POPULAR │  │     │  │             │  │
│   │     │  │+10% │  │  1,200  │  │2,600│  │   7,000     │  │
│   │$0.99│  │$4.99│  │ +20%    │  │+30% │  │   +40%      │  │
│   │     │  │     │  │  $9.99  │  │$19.99│ │   $49.99    │  │
│   └─────┘  └─────┘  └─────────┘  └─────┘  └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation
```typescript
// Mark packages with badges
function getCurrencyBadge(pkg: CurrencyPackage, allPackages: CurrencyPackage[]) {
  const sorted = [...allPackages].sort((a, b) => 
    parseFloat(a.price.amount) - parseFloat(b.price.amount)
  );
  const index = sorted.findIndex(p => p.sku === pkg.sku);
  
  if (index === sorted.length - 1) return 'BEST VALUE';
  if (index === Math.floor(sorted.length / 2)) return 'MOST POPULAR';
  return null;
}
```

---

## Section 5: Offer Chains / Progression Deals

**Purpose**: Reward repeat purchases, build habit.

### Types of Offer Chains

#### Daily Login Rewards
```
Day 1: 50 Gold    ✓ Claimed
Day 2: 100 Gold   ✓ Claimed  
Day 3: 1 Gem      ← Today
Day 4: 200 Gold   🔒
Day 5: 5 Gems     🔒
Day 6: 500 Gold   🔒
Day 7: EPIC CHEST 🔒
```

#### Cumulative Purchase Rewards
```
┌────────────────────────────────────────────────────────────┐
│  🏆 PURCHASE MILESTONES                                    │
│                                                            │
│  [$5]────[$15]────[$30]────[$50]────[$100]                │
│    ✓       ●        ○        ○        ○                   │
│   50💎    150💎   Skin    500💎   Legendary               │
│                                                            │
│  You've spent: $12.47  |  Next reward at $15!             │
└────────────────────────────────────────────────────────────┘
```

#### Sequential Bundles
After purchasing Bundle A, unlock Bundle B at a discount:

```
┌──────────────────┐     ┌──────────────────┐
│ ADVENTURE PACK I │ ──► │ ADVENTURE PACK II│
│ $4.99            │     │ $7.99 (was $14.99)│
│ ✓ PURCHASED      │     │ 🔓 UNLOCKED!     │
└──────────────────┘     └──────────────────┘
```

---

## Section 6: Item Catalog

**Purpose**: Discovery, browsing, virtual currency sink.

### Design Elements
- Category tabs/filters
- Sort options (price, newest, popular)
- Dual pricing display (real money + virtual currency)
- "Owned" badges for purchased items

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🛒 ITEM SHOP                                               │
│                                                             │
│  [All] [Weapons] [Armor] [Consumables] [Cosmetics]         │
│                                                             │
│  Sort: [Popular ▼]                    Filter: [In Stock ▼] │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │[Image]  │  │[Image]  │  │[Image]  │  │[Image]  │        │
│  │Flame    │  │Dragon   │  │Health   │  │Shadow   │        │
│  │Sword    │  │Shield   │  │Potion   │  │Skin     │        │
│  │         │  │         │  │         │  │         │        │
│  │500 💎   │  │450 💎   │  │$0.99    │  │$9.99    │        │
│  │or $4.99 │  │or $3.99 │  │or 100🪙 │  │         │        │
│  │[BUY]    │  │[BUY]    │  │[BUY]    │  │[BUY]    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Virtual Currency Purchase Flow
```typescript
async function purchaseWithCurrency(itemSku: string, currencySku: string) {
  // Check balance first
  const balance = await api.getVirtualBalance();
  const currency = balance.items.find(b => b.sku === currencySku);
  const item = currentItem; // from state
  const price = item.virtual_prices.find(vp => vp.sku === currencySku);
  
  if (!currency || currency.amount < price.amount) {
    // Show "Not enough currency" modal with link to currency shop
    showInsufficientFundsModal(currencySku, price.amount - (currency?.amount || 0));
    return;
  }
  
  // Execute purchase
  const result = await api.purchaseWithVirtualCurrency(itemSku, currencySku);
  showSuccessAnimation();
  refreshInventory();
}
```

---

## Section 7: Bundles

**Purpose**: Value-focused purchasing for savvy shoppers.

### Bundle Categories
- **Starter Bundles**: One-time, high discount
- **Themed Bundles**: Seasonal, event-based
- **Class/Role Bundles**: Targeted at playstyles
- **Progression Bundles**: Scaled to player level

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  📦 BUNDLES                                                 │
│                                                             │
│  [All] [Starter] [Weekly] [Themed] [Class Packs]           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔥 BATTLE READY BUNDLE                              │  │
│  │                                                      │  │
│  │  [Hero Image]        Contains:                       │  │
│  │                      • Flame Sword (500💎)           │  │
│  │                      • Dragon Shield (450💎)         │  │
│  │                      • 20x Health Potion ($9.99)     │  │
│  │                                                      │  │
│  │                      Total Value: $29.99             │  │
│  │  $̶2̶9̶.̶9̶9̶  $19.99     You Save: 33%                  │  │
│  │                                                      │  │
│  │  [ADD TO CART]                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Mobile Considerations

### Touch Targets
- Minimum 44x44px for buttons
- Adequate spacing between interactive elements

### Scroll Behavior
- Sticky header with cart icon
- Horizontal scroll for offer rows
- Pull-to-refresh for time-sensitive content

### Performance
- Lazy load images below fold
- Skeleton screens during loading
- Optimistic UI updates on purchase

---

## A/B Testing Recommendations

| Element | Variant A | Variant B | Metric |
|---------|-----------|-----------|--------|
| CTA Text | "Buy Now" | "Get Yours" | Conversion |
| Price Display | "$9.99" | "Only $9.99" | Click-through |
| Discount Badge | "50% OFF" | "Save $10" | Conversion |
| Timer Display | "Ends in 2h" | "Only 2h left!" | Urgency clicks |
| Hero Position | Top | After currency | Revenue per session |

---

## Conversion Optimization Checklist

- [ ] Featured section visible without scrolling
- [ ] All prices clearly displayed
- [ ] Discount savings shown in absolute and percentage
- [ ] Countdown timers on limited offers
- [ ] One-click purchase for logged-in users
- [ ] Cart accessible from any section
- [ ] Loading states don't block interaction
- [ ] Error messages are actionable
- [ ] Success feedback is immediate and satisfying
- [ ] Cross-sell prompts after purchase

---

## Next Steps

1. [Set up your catalog](03-catalog-setup.md) with required items
2. Implement sections in priority order (Featured → Currency → Items)
3. Configure promotions in Publisher Account
4. Test full purchase flow in sandbox
5. Set up analytics to measure section performance
