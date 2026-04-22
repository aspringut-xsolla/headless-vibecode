# Xsolla CLI

The official command-line interface for the Xsolla platform. Manage catalog, payments, authentication, and webshop operations directly from your terminal.

## Installation

```bash
# Check if installed
xsolla --version

# The CLI is typically installed via your package manager or direct download
# See Xsolla documentation for installation instructions
```

## Getting Started

### 1. Create or Log In to Publisher Account

**New account:**
```bash
xsolla publisher signup
```

**Existing account:**
```bash
xsolla publisher login
```

After login, your JWT is stored in the OS keychain (macOS Keychain / Windows Credential Manager) and used automatically.

### 2. Configure the CLI

```bash
# Initialize configuration file
xsolla config init

# Set your merchant ID
xsolla config set merchant_id YOUR_MERCHANT_ID

# Set your project ID
xsolla config set project_id YOUR_PROJECT_ID
```

### 3. Set API Key

```bash
# Set via environment variable (recommended for CI/CD)
export XSOLLA_API_KEY="your-api-key"

# Or generate a new key
xsolla publisher create-api-key
```

### 4. Check Status

```bash
xsolla publisher status
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `XSOLLA_API_KEY` | API key for Basic Auth (required for payments & catalog admin commands) |
| `XSOLLA_TOKEN` | Bearer token for OAuth2 authentication |
| `XSOLLA_SITEBUILDER_SESSION` | Publisher Account session cookie for Site Builder workflows |

---

## Global Flags

Available on all commands:

| Flag | Description |
|------|-------------|
| `--sandbox` | Use Xsolla sandbox endpoints |
| `--json` | Output pure JSON to stdout |
| `-o, --output` | Output format: `human`, `text`, `json`, `raw` |
| `--dry-run` | Preview actions without executing |
| `--profile` | Named configuration profile (default: "default") |
| `--environment` | Environment name from config |
| `-q, --quiet` | Suppress all stderr output |
| `--log-level` | Log level: error, warn, info, debug, trace |

---

## Command Groups

### Publisher Account Management

```bash
# Account lifecycle
xsolla publisher signup              # Create new account
xsolla publisher login               # Log in to existing account
xsolla publisher logout              # Remove JWT from keychain
xsolla publisher status              # Check authentication status
xsolla publisher get-profile         # View profile details

# Project management
xsolla publisher list-projects       # List all projects
xsolla publisher create-project      # Create new project
xsolla publisher get-project         # Get project details

# API key management
xsolla publisher create-api-key      # Generate new API key
xsolla publisher list-api-keys       # List existing keys
xsolla publisher revoke-api-key      # Revoke a key
```

### Catalog Operations

```bash
# List items (no auth required)
xsolla catalog list-catalog-items --project-id 12345
xsolla catalog list-catalog-items --project-id 12345 --country US --limit 50

# Get specific item
xsolla catalog get-catalog-item --project-id 12345 --sku sword_legendary

# List by type
xsolla catalog list-catalog-bundles --project-id 12345
xsolla catalog list-catalog-currency --project-id 12345
xsolla catalog list-catalog-games --project-id 12345

# List by group
xsolla catalog list-catalog-items-by-group --project-id 12345 --group-id weapons

# Admin operations (requires API key)
xsolla catalog create-items --project-id 12345 \
  --sku "new_item" \
  --name '{"en": "New Item"}' \
  --prices '[{"amount": 9.99, "currency": "USD"}]'

xsolla catalog update-items --project-id 12345 --sku "new_item" \
  --prices '[{"amount": 7.99, "currency": "USD"}]'

xsolla catalog delete-items --project-id 12345 --sku "new_item"

# Import catalog from CSV
xsolla catalog import-csv --project-id 12345 --file catalog.csv
```

### Cart & Webshop

```bash
# Cart operations (requires user token)
xsolla webshop get-cart --project-id 12345
xsolla webshop add-cart-item --project-id 12345 --sku sword_legendary --quantity 1
xsolla webshop remove-cart-item --project-id 12345 --sku sword_legendary
xsolla webshop clear-cart --project-id 12345

# Fill cart with multiple items
xsolla webshop fill-cart --project-id 12345 \
  --items '[{"sku": "sword", "quantity": 1}, {"sku": "potion", "quantity": 5}]'

# Create payment token (server-side)
xsolla webshop create-admin-payment-token --project-id 12345 \
  --user '{"id": {"value": "user123"}, "email": {"value": "user@example.com"}}' \
  --purchase '{"items": [{"sku": "sword_legendary", "quantity": 1}]}' \
  --settings '{"sandbox": true}'

# Create order from cart
xsolla webshop create-order-cart --project-id 12345

# Get order status
xsolla webshop get-order --project-id 12345 --order-id 12345678

# Search orders
xsolla webshop search-orders --project-id 12345 --user-id user123

# Free items
xsolla webshop grant-free-item --project-id 12345 --sku free_reward
xsolla webshop grant-free-cart --project-id 12345
```

### Payments

```bash
# Create payment token
xsolla payments create-token \
  --merchant-id 12345 \
  --user '{"id": {"value": "user123"}}' \
  --purchase '{"checkout": {"amount": 9.99, "currency": "USD"}}' \
  --settings '{"project_id": 12345, "sandbox": true}'

# Get transaction details
xsolla payments get-transactions --merchant-id 12345 --transaction-id 789012

# Search transactions
xsolla payments search-transactions --merchant-id 12345 \
  --datetime-from "2024-01-01" --datetime-to "2024-01-31"

# Refunds
xsolla payments create-refund --merchant-id 12345 --transaction-id 789012
xsolla payments create-partial-refund --merchant-id 12345 \
  --transaction-id 789012 --amount 5.00

# Saved payment methods
xsolla payments list-accounts --project-id 12345 --user-id user123
xsolla payments charge-accounts --project-id 12345 --user-id user123 \
  --account-id acc123 --amount 9.99 --currency USD
xsolla payments delete-accounts --project-id 12345 --user-id user123 \
  --account-id acc123
```

### User Authentication (Login API)

```bash
# Register user
xsolla login register-jwt --project-id 12345 \
  --username "player@example.com" \
  --password "SecurePass123!"

# Authenticate
xsolla login login-jwt --project-id 12345 \
  --username "player@example.com" \
  --password "SecurePass123!"

# Get user details
xsolla login get-users --project-id 12345

# Update user
xsolla login update-users --project-id 12345 \
  --nickname "NewNickname"

# Password reset
xsolla login reset-password --project-id 12345 \
  --username "player@example.com"

# Passwordless (email)
xsolla login start-email-jwt --project-id 12345 --email "player@example.com"
xsolla login confirm-email-jwt --project-id 12345 \
  --email "player@example.com" --code "123456"

# User attributes
xsolla login list-attributes --project-id 12345
xsolla login update-attributes --project-id 12345 \
  --attributes '[{"key": "level", "value": "42"}]'
```

### Inventory

```bash
# List user inventory
xsolla inventory list-items --project-id 12345 --user-id user123

# Get virtual currency balance
xsolla inventory get-balance --project-id 12345 --user-id user123

# Grant entitlement (admin)
xsolla inventory grant-entitlements --project-id 12345 \
  --user-id user123 --sku sword_legendary --quantity 1

# Revoke entitlement (admin)
xsolla inventory revoke-entitlements --project-id 12345 \
  --user-id user123 --sku sword_legendary --quantity 1
```

### Site Builder Webshop

```bash
# Create webshop website
xsolla webshop create-website --project-id 12345 --name "My Game Shop"

# Manage blocks/modules
xsolla webshop list-blocks --project-id 12345 --website-id ws123
xsolla webshop hide-block --project-id 12345 --website-id ws123 --block-id blk123
xsolla webshop show-block --project-id 12345 --website-id ws123 --block-id blk123
xsolla webshop reorder-blocks --project-id 12345 --website-id ws123 \
  --block-ids "blk1,blk2,blk3"

# Update theme
xsolla webshop update-website-theme --project-id 12345 --website-id ws123 \
  --theme "dark"

# Publish
xsolla webshop publish-website --project-id 12345 --website-id ws123
xsolla webshop publication-status --project-id 12345 --website-id ws123
```

---

## Common Workflows

### Quick Catalog Check

```bash
# List all items with JSON output
xsolla catalog list-catalog-items --project-id 12345 --json | jq '.items[].sku'

# Check specific item exists
xsolla catalog get-catalog-item --project-id 12345 --sku sword_legendary --json
```

### Test Purchase Flow (Sandbox)

```bash
# 1. Create payment token
TOKEN=$(xsolla webshop create-admin-payment-token --project-id 12345 \
  --user '{"id": {"value": "test_user"}}' \
  --purchase '{"items": [{"sku": "test_item", "quantity": 1}]}' \
  --settings '{"sandbox": true}' \
  --json | jq -r '.token')

# 2. Output Pay Station URL
echo "https://secure.xsolla.com/paystation4/?token=$TOKEN"

# 3. After payment, check order status
xsolla webshop get-order --project-id 12345 --order-id ORDER_ID --json
```

### Bulk Item Import

```bash
# Prepare CSV with items, then import
xsolla catalog import-csv --project-id 12345 --file items.csv --sandbox

# Check import status
xsolla catalog get-admin-import-status --project-id 12345
```

### CI/CD Integration

```bash
# In your CI/CD pipeline
export XSOLLA_API_KEY="${XSOLLA_API_KEY_SECRET}"

# Verify connection
xsolla publisher status --quiet || exit 1

# Deploy catalog updates
xsolla catalog update-items --project-id $PROJECT_ID --sku $SKU \
  --prices "$NEW_PRICES" --json

# Verify update
xsolla catalog get-catalog-item --project-id $PROJECT_ID --sku $SKU --json
```

---

## Configuration File

The CLI uses `.xsolla.json` for configuration:

```json
{
  "merchant_id": 12345,
  "project_id": 67890,
  "profiles": {
    "default": {
      "merchant_id": 12345,
      "project_id": 67890
    },
    "staging": {
      "merchant_id": 12345,
      "project_id": 11111
    }
  }
}
```

Switch profiles:
```bash
xsolla --profile staging catalog list-catalog-items
```

---

## Output Formats

```bash
# Human-readable (default)
xsolla catalog list-catalog-items --project-id 12345

# JSON (for scripting)
xsolla catalog list-catalog-items --project-id 12345 --json

# JSON with jq processing
xsolla catalog list-catalog-items --project-id 12345 --json | jq '.items[] | {sku, name, price: .price.amount}'

# Raw (API response as-is)
xsolla catalog list-catalog-items --project-id 12345 -o raw

# Text (tab-separated, good for grep)
xsolla catalog list-catalog-items --project-id 12345 -o text
```

---

## Troubleshooting

### Authentication Errors

```bash
# Check current status
xsolla publisher status

# Re-login if needed
xsolla publisher login

# Verify API key is set
echo $XSOLLA_API_KEY
```

### Debug Mode

```bash
# Enable debug logging
xsolla --log-level debug catalog list-catalog-items --project-id 12345

# Trace all HTTP requests
xsolla --log-level trace payments create-token ...
```

### Dry Run

```bash
# Preview what would happen without executing
xsolla --dry-run catalog delete-items --project-id 12345 --sku test_item
```

---

## Shell Completion

```bash
# Bash
xsolla completion bash > /etc/bash_completion.d/xsolla

# Zsh
xsolla completion zsh > "${fpath[1]}/_xsolla"

# Fish
xsolla completion fish > ~/.config/fish/completions/xsolla.fish
```
