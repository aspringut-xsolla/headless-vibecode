# Catalog Setup & Population

Populate your Xsolla project with items, currencies, bundles, and LiveOps content for development and testing.

## Overview

Before building a webshop UI, your Xsolla project needs:

| Content Type | Purpose | Required |
|--------------|---------|----------|
| Virtual Currency | In-game money (gold, gems, coins) | Yes |
| Currency Packages | Purchasable currency bundles | Yes |
| Virtual Items | Consumables, cosmetics, equipment | Yes |
| Bundles | Grouped items at discount | Recommended |
| Item Groups | Category organization | Recommended |
| Promotions | Discounts, sales, limited offers | For LiveOps |

---

## Check Existing Catalog

Before creating new items, check what already exists:

```bash
# List all items
xsolla catalog list-catalog-items --project-id 305100 --json | jq '.items | length'

# List virtual currencies
xsolla catalog list-catalog-currency --project-id 305100 --json

# List bundles
xsolla catalog list-catalog-bundles --project-id 305100 --json

# List item groups
xsolla catalog list-catalog-groups --project-id 305100 --json
```

If your catalog is empty or has placeholder items, proceed with population.

---

## Quick Setup: Example Catalog

### Step 1: Create Virtual Currencies

Every webshop needs at least one virtual currency:

```bash
# Premium currency (purchased with real money)
xsolla catalog create-currency --project-id 305100 \
  --sku "gems" \
  --name '{"en": "Gems"}' \
  --description '{"en": "Premium currency for exclusive items"}' \
  --image-url "https://cdn.example.com/gems.png" \
  --is-default false

# Soft currency (earned in-game, also purchasable)
xsolla catalog create-currency --project-id 305100 \
  --sku "gold" \
  --name '{"en": "Gold Coins"}' \
  --description '{"en": "Standard currency for everyday items"}' \
  --image-url "https://cdn.example.com/gold.png" \
  --is-default true
```

### Step 2: Create Currency Packages

Sell virtual currency in tiered packages:

```bash
# Small pack
xsolla catalog create-currency-package --project-id 305100 \
  --sku "gems-100" \
  --name '{"en": "100 Gems"}' \
  --description '{"en": "A handful of gems"}' \
  --image-url "https://cdn.example.com/gems-small.png" \
  --currency-sku "gems" \
  --currency-amount 100 \
  --prices '[{"amount": 0.99, "currency": "USD", "is_default": true}]'

# Medium pack (better value)
xsolla catalog create-currency-package --project-id 305100 \
  --sku "gems-550" \
  --name '{"en": "550 Gems"}' \
  --description '{"en": "10% bonus gems!"}' \
  --currency-sku "gems" \
  --currency-amount 550 \
  --prices '[{"amount": 4.99, "currency": "USD", "is_default": true}]'

# Large pack (best value)
xsolla catalog create-currency-package --project-id 305100 \
  --sku "gems-1200" \
  --name '{"en": "1200 Gems"}' \
  --description '{"en": "20% bonus gems!"}' \
  --currency-sku "gems" \
  --currency-amount 1200 \
  --prices '[{"amount": 9.99, "currency": "USD", "is_default": true}]'

# Whale pack
xsolla catalog create-currency-package --project-id 305100 \
  --sku "gems-6500" \
  --name '{"en": "6500 Gems"}' \
  --description '{"en": "30% bonus - Best Value!"}' \
  --currency-sku "gems" \
  --currency-amount 6500 \
  --prices '[{"amount": 49.99, "currency": "USD", "is_default": true}]'
```

### Step 3: Create Item Groups

Organize items into categories:

```bash
xsolla catalog create-group --project-id 305100 \
  --external-id "weapons" \
  --name '{"en": "Weapons"}'

xsolla catalog create-group --project-id 305100 \
  --external-id "armor" \
  --name '{"en": "Armor"}'

xsolla catalog create-group --project-id 305100 \
  --external-id "consumables" \
  --name '{"en": "Consumables"}'

xsolla catalog create-group --project-id 305100 \
  --external-id "cosmetics" \
  --name '{"en": "Cosmetics"}'

xsolla catalog create-group --project-id 305100 \
  --external-id "featured" \
  --name '{"en": "Featured"}'
```

### Step 4: Create Virtual Items

Mix of consumables, equipment, and cosmetics:

```bash
# Consumables (purchasable with real money OR virtual currency)
xsolla catalog create-items --project-id 305100 \
  --sku "health-potion" \
  --name '{"en": "Health Potion"}' \
  --description '{"en": "Restores 50 HP instantly"}' \
  --image-url "https://cdn.example.com/health-potion.png" \
  --item-type "consumable" \
  --prices '[{"amount": 0.99, "currency": "USD", "is_default": true}]' \
  --virtual-prices '[{"amount": 100, "sku": "gold"}]' \
  --groups '["consumables"]'

xsolla catalog create-items --project-id 305100 \
  --sku "mana-potion" \
  --name '{"en": "Mana Potion"}' \
  --description '{"en": "Restores 50 MP instantly"}' \
  --item-type "consumable" \
  --prices '[{"amount": 0.99, "currency": "USD", "is_default": true}]' \
  --virtual-prices '[{"amount": 100, "sku": "gold"}]' \
  --groups '["consumables"]'

xsolla catalog create-items --project-id 305100 \
  --sku "xp-boost-1h" \
  --name '{"en": "XP Boost (1 Hour)"}' \
  --description '{"en": "Double XP for 1 hour"}' \
  --item-type "consumable" \
  --prices '[{"amount": 1.99, "currency": "USD", "is_default": true}]' \
  --virtual-prices '[{"amount": 50, "sku": "gems"}]' \
  --groups '["consumables", "featured"]'

# Equipment (premium currency only)
xsolla catalog create-items --project-id 305100 \
  --sku "sword-flame" \
  --name '{"en": "Flame Sword"}' \
  --description '{"en": "A blade wreathed in eternal fire. +15 Attack, +10 Fire Damage"}' \
  --item-type "non_consumable" \
  --virtual-prices '[{"amount": 500, "sku": "gems"}]' \
  --groups '["weapons", "featured"]'

xsolla catalog create-items --project-id 305100 \
  --sku "shield-dragon" \
  --name '{"en": "Dragon Shield"}' \
  --description '{"en": "Forged from dragon scales. +25 Defense, +15 Fire Resistance"}' \
  --item-type "non_consumable" \
  --virtual-prices '[{"amount": 450, "sku": "gems"}]' \
  --groups '["armor"]'

# Cosmetics (real money)
xsolla catalog create-items --project-id 305100 \
  --sku "skin-shadow-knight" \
  --name '{"en": "Shadow Knight Skin"}' \
  --description '{"en": "Transform into a mysterious shadow warrior"}' \
  --item-type "non_consumable" \
  --prices '[{"amount": 9.99, "currency": "USD", "is_default": true}]' \
  --groups '["cosmetics", "featured"]'

xsolla catalog create-items --project-id 305100 \
  --sku "emote-victory-dance" \
  --name '{"en": "Victory Dance Emote"}' \
  --description '{"en": "Celebrate your wins in style"}' \
  --item-type "non_consumable" \
  --prices '[{"amount": 2.99, "currency": "USD", "is_default": true}]' \
  --virtual-prices '[{"amount": 150, "sku": "gems"}]' \
  --groups '["cosmetics"]'
```

### Step 5: Create Bundles

High-value bundles drive conversions:

```bash
# Starter Bundle (one-time purchase, massive value)
xsolla catalog create-bundle --project-id 305100 \
  --sku "starter-bundle" \
  --name '{"en": "Starter Bundle"}' \
  --description '{"en": "Everything you need to begin your adventure! 80% OFF - One time only!"}' \
  --image-url "https://cdn.example.com/starter-bundle.png" \
  --prices '[{"amount": 4.99, "currency": "USD", "is_default": true, "amount_without_discount": 24.99}]' \
  --content '[
    {"sku": "gems", "quantity": 500},
    {"sku": "gold", "quantity": 5000},
    {"sku": "health-potion", "quantity": 10},
    {"sku": "xp-boost-1h", "quantity": 3}
  ]'

# Weekly Deal
xsolla catalog create-bundle --project-id 305100 \
  --sku "weekly-deal" \
  --name '{"en": "Weekly Deal"}' \
  --description '{"en": "This week only! Great value pack."}' \
  --prices '[{"amount": 9.99, "currency": "USD", "is_default": true, "amount_without_discount": 19.99}]' \
  --content '[
    {"sku": "gems", "quantity": 1000},
    {"sku": "xp-boost-1h", "quantity": 5}
  ]'

# Battle Ready Bundle
xsolla catalog create-bundle --project-id 305100 \
  --sku "battle-bundle" \
  --name '{"en": "Battle Ready Bundle"}' \
  --description '{"en": "Gear up for combat with premium equipment"}' \
  --prices '[{"amount": 19.99, "currency": "USD", "is_default": true, "amount_without_discount": 29.99}]' \
  --content '[
    {"sku": "sword-flame", "quantity": 1},
    {"sku": "shield-dragon", "quantity": 1},
    {"sku": "health-potion", "quantity": 20}
  ]'
```

---

## Bulk Import from CSV

For larger catalogs, use CSV import:

### CSV Format

```csv
sku,name_en,name_de,description_en,type,price_usd,virtual_price_gems,groups
health-potion,Health Potion,Heiltrank,Restores 50 HP,consumable,0.99,50,consumables
mana-potion,Mana Potion,Manatrank,Restores 50 MP,consumable,0.99,50,consumables
sword-basic,Basic Sword,Einfaches Schwert,A simple blade,non_consumable,4.99,200,"weapons,starter"
```

### Import Command

```bash
xsolla catalog import-csv --project-id 305100 --file catalog.csv --sandbox
```

---

## LiveOps: Promotions & Time-Limited Offers

### Create a Promotion

```bash
# 20% off all items in "featured" group
xsolla promotions create --project-id 305100 \
  --name "Summer Sale" \
  --discount-type "percentage" \
  --discount-value 20 \
  --conditions '{"groups": ["featured"]}' \
  --start-date "2024-06-01T00:00:00Z" \
  --end-date "2024-06-30T23:59:59Z"
```

### Create Time-Limited Bundle

```bash
# Limited availability bundle
xsolla catalog create-bundle --project-id 305100 \
  --sku "flash-sale-bundle" \
  --name '{"en": "Flash Sale Bundle (24h Only!)"}' \
  --description '{"en": "Grab it before its gone!"}' \
  --prices '[{"amount": 2.99, "currency": "USD", "is_default": true, "amount_without_discount": 9.99}]' \
  --content '[{"sku": "gems", "quantity": 300}]' \
  --limits '{"per_user": 1, "available_until": "2024-06-02T00:00:00Z"}'
```

---

## Verification Checklist

After setup, verify your catalog:

```bash
# Count items by type
echo "Virtual Items:"
xsolla catalog list-catalog-items --project-id 305100 --json | jq '.items | length'

echo "Currency Packages:"
xsolla catalog list-catalog-currency-packages --project-id 305100 --json | jq '.items | length'

echo "Bundles:"
xsolla catalog list-catalog-bundles --project-id 305100 --json | jq '.items | length'

echo "Groups:"
xsolla catalog list-catalog-groups --project-id 305100 --json | jq '.groups | length'
```

### Required for Webshop Testing

- [ ] At least 1 virtual currency defined
- [ ] At least 3 currency packages (small/medium/large)
- [ ] At least 5 virtual items with names and images
- [ ] At least 2 bundles with discounted prices
- [ ] Item groups for navigation
- [ ] Mix of real-money and virtual-currency pricing
- [ ] **All items published** (`is_show_in_store: true`) - required for cart functionality

---

## Updating Existing Items

Fix items with missing data:

```bash
# Add name to item
xsolla catalog update-items --project-id 305100 \
  --sku "legendary-dragon-blade-001" \
  --name '{"en": "Legendary Dragon Blade"}'

# Add image
xsolla catalog update-items --project-id 305100 \
  --sku "legendary-dragon-blade-001" \
  --image-url "https://cdn.example.com/dragon-blade.png"

# Add to groups
xsolla catalog update-items --project-id 305100 \
  --sku "legendary-dragon-blade-001" \
  --groups '["weapons", "featured"]'
```

---

## Publishing Items to Storefront

**Important**: Items created via the API are NOT visible to users by default. They must be "published" (set `is_show_in_store: true`) to appear in the storefront catalog and work with user-authenticated APIs like the cart.

### Why This Matters

| API Type | Sees Unpublished Items? | Use Case |
|----------|------------------------|----------|
| Admin API (Basic Auth) | Yes | Server-side catalog management |
| User API (Bearer token) | No | Client-side browsing, cart, purchases |

If your webshop fetches items via admin API but users can't add them to cart, the items likely aren't published.

### Publishing Virtual Items

Virtual items require name, description, and prices when updating:

```bash
xsolla catalog update-items --project-id 305100 \
  --item-sku "health-potion" \
  --sku "health-potion" \
  --name '{"en":"Health Potion"}' \
  --description '{"en":"Restores 50 HP instantly"}' \
  --prices '[{"amount":0.99,"currency":"USD","is_default":true,"is_enabled":true}]' \
  --is-show-in-store
```

### Publishing Bundles and Currency Packages

Use the `unhide-admin-bundle` command:

```bash
# Publish a bundle
xsolla catalog unhide-admin-bundle --project-id 305100 --bundle-sku starter-bundle

# Publish a currency package (same command - they're bundle types internally)
xsolla catalog unhide-admin-bundle --project-id 305100 --bundle-sku gems-100
```

To hide an item from the store:

```bash
xsolla catalog hide-admin-bundle --project-id 305100 --bundle-sku flash-sale-bundle
```

### Bulk Publish All Items

Publish all virtual items in one script:

```bash
# Get all item SKUs and publish each
xsolla catalog list-items --project-id 305100 --json | \
  jq -r '.data.items[] | select(.is_show_in_store == false) | .sku' | \
  while read sku; do
    echo "Publishing $sku..."
    # Note: update-items requires name/description/prices - fetch current values first
    xsolla catalog get-items --project-id 305100 --sku "$sku" --json | \
      jq -r '"\(.data.name | @json)\t\(.data.description | @json)\t\(.data.prices | @json)"' | \
      while IFS=$'\t' read name desc prices; do
        xsolla catalog update-items --project-id 305100 \
          --item-sku "$sku" --sku "$sku" \
          --name "$name" --description "$desc" --prices "$prices" \
          --is-show-in-store
      done
  done
```

### Verification

Verify items are visible in the storefront:

```bash
# These should return the same count if all items are published
echo "Admin API count:"
xsolla catalog list-items --project-id 305100 --json | jq '.data.items | length'

echo "Storefront API count:"
xsolla catalog list-catalog-items --project-id 305100 --json | jq '.data.items | length'
```

---

## Image Requirements

**Important**: The `image_url` must be a publicly accessible URL. Xsolla does not host arbitrary images when set via API.

**Options for hosting images:**
1. **Your CDN** - Upload to S3, CloudFront, or similar
2. **Placeholder services** - For development, use `https://placehold.co/512x512/bgColor/textColor?text=Label`
3. **Publisher Account** - Upload directly through the UI (Xsolla will host)

**Recommended sizes:**
| Item Type | Size |
|-----------|------|
| Virtual items | 512x512px |
| Currency packages | 512x512px |
| Bundles | 512x512px or 1024x512px |
| Currency icon | 128x128px |

**API endpoints for updating images:**
- Virtual items: `PUT /admin/items/virtual_items/sku/{sku}`
- Bundles: `PUT /admin/items/bundle/sku/{sku}`
- Currency packages: `PUT /admin/items/virtual_currency/package/sku/{sku}`

---

## Publisher Account UI

For complex configurations or visual editing:

1. Go to https://publisher.xsolla.com
2. Select your project
3. Navigate to **Store** → **Virtual Items** / **Virtual Currency** / **Bundles**
4. Use the visual editor for:
   - Uploading images (Xsolla-hosted)
   - Setting regional prices
   - Configuring purchase limits
   - Creating complex promotions

---

## Next Steps

Once your catalog is populated:

1. [Design your webshop](05-webshop-design.md) - Create high-converting UI
2. Test purchases in sandbox mode
3. Configure webhooks for fulfillment
