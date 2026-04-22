# Branding & Theming Guide

A webshop is a marketing and branding exercise. Before writing code, establish the visual identity that will make the shop feel like a natural extension of the game.

---

## Why Branding Matters

- **Trust**: A branded shop looks official, not like a scam
- **Immersion**: Players stay "in the game" while spending
- **Conversion**: Cohesive design increases purchase confidence
- **Recognition**: Consistent branding across game and shop reinforces identity
- **Fun & Engagement**: Shopping should feel like part of the game experience, not a chore - animations, sounds, and visual feedback make purchases rewarding

---

## Discovery Questions

Before designing, gather this information from the game team:

### Game Identity

| Question | Answer |
|----------|--------|
| Game name | |
| Genre (RPG, shooter, casual, etc.) | |
| Visual style (realistic, stylized, pixel, anime) | |
| Tone (serious, playful, dark, competitive) | |
| Target audience (age, gamer type) | |
| Platform (PC, mobile, console, web) | |

### Existing Brand Assets

| Asset | Have It? | Format | Notes |
|-------|----------|--------|-------|
| Logo (primary) | ☐ | | SVG preferred |
| Logo (icon/mark) | ☐ | | For favicon, small spaces |
| Color palette | ☐ | | Hex codes |
| Typography/fonts | ☐ | | TTF/OTF or Google Font names |
| UI kit or style guide | ☐ | | Figma, Sketch, PDF |
| Marketing screenshots | ☐ | | For reference |
| In-game UI examples | ☐ | | Buttons, panels, etc. |

### Color Palette

Request specific hex codes:

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | | #______ | Main buttons, key actions |
| Secondary | | #______ | Supporting elements |
| Accent | | #______ | Highlights, badges, sales |
| Background (dark) | | #______ | Page/card backgrounds |
| Background (light) | | #______ | Alternate sections |
| Text (primary) | | #______ | Body text |
| Text (muted) | | #______ | Secondary text |
| Success | | #______ | Confirmations |
| Error | | #______ | Errors, warnings |
| Sale/discount | | #______ | Price callouts |

### Typography

| Role | Font | Fallback |
|------|------|----------|
| Headings | | sans-serif |
| Body text | | sans-serif |
| Prices/numbers | | monospace |
| Accent/special | | |

---

## Asset Requirements

### Logo Files

| Type | Size | Format | Purpose |
|------|------|--------|---------|
| Full logo | 400x100px | SVG, PNG | Header |
| Square logo | 200x200px | SVG, PNG | Footer, loading |
| Favicon | 32x32px | ICO, PNG | Browser tab |
| Social/OG | 1200x630px | PNG, JPG | Link previews |

### Item Images

Every catalog item needs an image. Missing images = unprofessional shop.

| Item Type | Recommended Size | Format | Notes |
|-----------|------------------|--------|-------|
| Virtual items | 512x512px | PNG | Transparent background |
| Bundles | 1024x512px | PNG | Show contents or hero art |
| Currency icon | 128x128px | PNG/SVG | Used inline with prices |
| Currency packages | 512x512px | PNG | Stacks, piles, chests |
| Category icons | 64x64px | PNG/SVG | Navigation tabs |

### Promotional Assets

| Asset | Size | Purpose |
|-------|------|---------|
| Hero banner | 1920x600px | Featured section background |
| Sale banner | 1200x400px | Limited-time offers |
| Mobile hero | 800x600px | Responsive hero |

---

## Theme Implementation

### CSS Variables

Create a theme file with CSS custom properties:

```css
:root {
  /* Brand Colors */
  --color-primary: #5B4FCF;
  --color-primary-hover: #4A3FB8;
  --color-secondary: #2D2A4A;
  --color-accent: #FFD700;
  
  /* Backgrounds */
  --color-bg-page: #1A1A2E;
  --color-bg-card: #252542;
  --color-bg-card-hover: #2D2D4A;
  
  /* Text */
  --color-text: #FFFFFF;
  --color-text-muted: #A0A0B0;
  --color-text-accent: #FFD700;
  
  /* Feedback */
  --color-success: #4CAF50;
  --color-error: #F44336;
  --color-sale: #FF5722;
  
  /* Typography */
  --font-heading: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.4);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Genre-Specific Patterns

Different game genres call for different visual treatments:

#### Fantasy RPG
```css
:root {
  --color-primary: #C9A227;      /* Gold */
  --color-bg-page: #1A1510;      /* Dark parchment */
  --color-bg-card: #2A2318;      /* Weathered leather */
  --font-heading: 'Cinzel Decorative', serif;
  --radius-md: 2px;              /* Sharp, medieval corners */
}
```
- Ornate borders, filigree decorations
- Parchment or stone textures
- Gold and bronze accents
- Medieval-inspired iconography

#### Sci-Fi / Cyberpunk
```css
:root {
  --color-primary: #00FFFF;      /* Cyan neon */
  --color-accent: #FF00FF;       /* Magenta */
  --color-bg-page: #0A0A12;      /* Deep space black */
  --font-heading: 'Orbitron', sans-serif;
  --radius-md: 0;                /* Hard edges */
}
```
- Glowing borders, neon effects
- Grid patterns, scan lines
- Holographic/iridescent accents
- Tech-inspired iconography

#### Casual / Mobile
```css
:root {
  --color-primary: #FF6B6B;      /* Friendly coral */
  --color-accent: #4ECDC4;       /* Teal */
  --color-bg-page: #FFFFFF;      /* Clean white */
  --font-heading: 'Nunito', sans-serif;
  --radius-md: 16px;             /* Soft, rounded */
}
```
- Bright, saturated colors
- Large touch targets
- Bouncy animations
- Playful iconography

#### Competitive / Esports
```css
:root {
  --color-primary: #FF4655;      /* Aggressive red */
  --color-bg-page: #0F1923;      /* Dark tactical */
  --font-heading: 'Rajdhani', sans-serif;
  --radius-md: 4px;              /* Sharp but not harsh */
}
```
- Bold, high-contrast colors
- Clean, minimal layout
- Team color support
- Achievement/rank displays

#### Horror / Dark
```css
:root {
  --color-primary: #8B0000;      /* Blood red */
  --color-accent: #4A0E0E;       /* Deep crimson */
  --color-bg-page: #0D0D0D;      /* Void black */
  --font-heading: 'Creepster', cursive;
}
```
- Dark backgrounds, red accents
- Distressed textures
- Subtle animations (flicker, pulse)
- Atmospheric imagery

---

## Component Theming Checklist

Apply the theme consistently across all components:

### Navigation & Header
- [ ] Logo displays correctly at all sizes
- [ ] Nav links use brand typography
- [ ] Active states use primary/accent color
- [ ] Mobile menu matches desktop theme

### Buttons
- [ ] Primary button uses brand primary color
- [ ] Hover/active states defined
- [ ] Disabled state is clearly distinct
- [ ] "Buy Now" buttons are prominent
- [ ] Secondary/outline variants exist

### Cards (Items, Bundles, Currency)
- [ ] Background uses card color
- [ ] Hover state adds shadow or border
- [ ] Image containers have consistent aspect ratio
- [ ] Price displays are prominent
- [ ] Sale prices use accent/sale color

### Badges & Labels
- [ ] "Sale" badge uses sale color
- [ ] "New" badge is distinct
- [ ] "Popular" / "Best Value" badges stand out
- [ ] "Limited Time" creates urgency

### Forms & Inputs
- [ ] Input borders match theme
- [ ] Focus states use primary color
- [ ] Error states use error color
- [ ] Placeholder text is readable

### Feedback States
- [ ] Loading spinners match theme
- [ ] Success toasts use success color
- [ ] Error messages are clear
- [ ] Empty states have themed illustrations

### Footer
- [ ] Background complements header
- [ ] Links are readable
- [ ] Legal text is appropriately muted

---

## Review Process

### Internal Review
1. Apply theme to development build
2. Screenshot key pages (shop, cart, checkout)
3. Compare side-by-side with game screenshots
4. Check color contrast (WCAG AA minimum)
5. Test on mobile viewport

### Client Review
1. Share screenshots or staging link
2. Ask specific questions:
   - "Does this feel like [Game Name]?"
   - "Are the colors accurate to your brand?"
   - "Is the typography readable and appropriate?"
   - "What feels off or needs adjustment?"
3. Document feedback
4. Iterate and re-review

### Sign-Off Checklist
- [ ] Colors match approved palette
- [ ] Logo displays correctly
- [ ] Typography is readable
- [ ] Mobile layout approved
- [ ] Client has given written approval

---

## Common Pitfalls

| Problem | Solution |
|---------|----------|
| No assets provided | Request upfront, block on delivery |
| "Just make it look good" | Push back, get concrete references |
| Colors don't match game | Request hex codes from art team |
| Font not web-safe | Use Google Fonts alternative or license font |
| Logo is low-res | Request vector (SVG) or high-res PNG |
| Dark text on dark bg | Test contrast ratios, adjust |
| Theme feels generic | Add game-specific decorative elements |

---

## Resources

### Font Sources
- [Google Fonts](https://fonts.google.com) - Free, web-optimized
- [Adobe Fonts](https://fonts.adobe.com) - With Creative Cloud
- [Font Squirrel](https://fontsquirrel.com) - Free commercial fonts

### Color Tools
- [Coolors](https://coolors.co) - Palette generator
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance
- [Adobe Color](https://color.adobe.com) - Color wheel and themes

### Inspiration
- [Dribbble](https://dribbble.com/search/game-store) - Game store designs
- [Awwwards](https://awwwards.com) - Award-winning web design
- Competitor game stores - See what works in the genre
