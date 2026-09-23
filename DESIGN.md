# Pilot — Landing Page Design System

A reference doc for the visual language of the Pilot marketing site: a "creative intelligence" / human-data evaluation lab. The design pairs a quiet, editorial, art-gallery tone (Renaissance/Baroque oil-painting imagery, serif display type, generous whitespace) with a modern SaaS structure (pill buttons, stat cards, badge tags, sticky nav). The overall feeling is **museum meets research lab**.

---

## 1. Brand Personality

- **Tone:** intelligent, restrained, confident — no gradients, no neon, no glossy 3D. Feels curated, not "startup-templated."
- **Core visual conceit:** classical portrait paintings (Renaissance/Baroque) treated as the "face" of human creative taste, juxtaposed against clinical/technical UI elements (halftone dot patterns, stat cards, benchmark cards). This visualizes the brand's thesis: human taste + AI evaluation.
- **Motifs:** oil paintings, gilded picture frames, velvet drapery, books, quills, microscopes — all reinforcing "expertise / craftsmanship / connoisseurship."

---

## 2. Color Palette

| Token | Hex (approx.) | RGB | Usage |
|---|---|---|---|
| `--color-cream` | `#F5F2ED` | 245, 242, 237 | Primary page background, nav bar |
| `--color-cream-alt` | `#FBFAF6` | 251, 250, 246 | Secondary light section bg (slightly whiter) |
| `--color-ink` | `#26221E` / `#201614` | ~38, 34, 30 | Primary body/heading text (warm near-black) |
| `--color-text-muted` | `#474642` | 71, 70, 66 | Secondary/paragraph text on light bg |
| `--color-teal-deep` | `#256571` | 37, 101, 113 | Primary brand teal — section backgrounds, tags |
| `--color-teal-card` | `#397478` | 57, 116, 120 | Card backgrounds within teal sections |
| `--color-mint` | `#C3E1DF` / `#C8E1DD` | 195–200, 225, 221 | Hero background wash, light teal section bg |
| `--color-mint-pale` | `#BDD6D2` | 189, 214, 210 | Quote/testimonial card background |
| `--color-forest` | `#233E2B` | 35, 62, 43 | Deep green accent block (hero, under portrait) |
| `--color-brown-dark` | `#3A2C1F` | 58, 44, 31 | "AI doesn't replace creativity" section bg, dark drapery |
| `--color-gold` | `#8A6D3B` (ornamental) | — | Picture-frame molding accents between sections |
| `--color-btn-dark` | `#454540` | 68, 69, 64 | Primary CTA pill button ("Request partnership") |
| `--color-btn-light` | `#F5F2ED` w/ border | — | Secondary/outline pill button ("Explore research") |
| `--color-white` | `#FFFFFF` | 255,255,255 | Stat-card backgrounds, footer top edge |

**Palette logic:** Two alternating "zones" — warm cream/off-white zones (editorial, text-forward) and deep teal/forest zones (product/data-forward: benchmarks, stats, feedback CTAs). Dark brown/black is reserved for the single most emotive section ("AI doesn't replace creativity"). No saturated brand color beyond the muted teal family — everything else is neutral, letting the painting imagery carry color.

---

## 3. Typography

Two-typeface system: a classic serif for display/editorial moments, a plain grotesk/sans for UI and body copy.

| Role | Family (visual match) | Weight/Style | Notes |
|---|---|---|---|
| Display headlines ("Creative intelligence.", "The Network of Human Taste", "Feedback that feels creative") | Serif — Georgia/Tiempos/Times-like transitional serif | Regular, not bold | Large scale (48–90px+), tight leading, often line-broken mid-phrase for rhythm. Occasionally mixed sizes within one headline for emphasis (see "Feedback that feels creative"). |
| Logo wordmark "Pilot" | Bold slab/serif | Bold | Paired with a light-tracked sans caps sub-mark next to it |
| Section eyebrow labels (card overlines, e.g. "PUBLIC LAUNCH-FOCUSED RESEARCH") | Sans-serif | Medium, uppercase, letter-spaced | Small size (~11px), high tracking, low-emphasis color (white/70% on teal cards) |
| Nav links, buttons, body copy, stat labels | Sans-serif (Inter/Helvetica-like grotesk) | Regular/Medium | Clean, small, functional — the "lab" counterpoint to the serif's "gallery" voice |
| Stat numbers ("1.7M+", "400+", "$250M+") | Sans-serif | Regular/Light, large scale | Numbers are large and light-weight rather than bold — quiet confidence rather than shouting |
| Quote/testimonial text | Serif, italic-leaning | Regular | Set inside a card with a large decorative quotation mark |

**Type pairing rule:** Every major section title is serif; every piece of supporting/functional text (nav, buttons, tags, captions, stats labels) is sans. This binary is consistent throughout and is the single strongest branding device on the page.

---

## 4. Layout & Grid

- **Container:** centered, generous side margins (roughly 8–10% of viewport on desktop), max-width content column for text (~600–700px) even on wide screens — text never stretches full width.
- **Vertical rhythm:** very tall page (long-form scroll), sections separated by large flat color-block bands rather than thin dividers. Whitespace is used deliberately as pacing (e.g. large empty cream gaps before "Built on real-world creative expertise" and "The Network of Human Taste" headlines build anticipation).
- **Grids:**
  - 2×2 image-card grid for the "ecosystem" offerings section (equal-size square-ish cards, small gutter, teal card backgrounds).
  - 3-column stat bar (white cards with subtle shadow, sitting mid-image, straddling two sections — an intentional "overlap" layering technique).
  - Asymmetric collage grid for "Feedback that feels creative" — small square portrait thumbnails of varying size scattered around oversized display type, center-weighted composition.
  - Footer: 3-column (brand block / nav links / CTA + social), with a full-bleed painting strip cropped at the very bottom edge as a decorative footer cap.
- **Framing device:** an ornate gold picture-frame molding graphic is used as a full-width horizontal divider between the dark drapery section and the cream "network for creative expertise" section — reinforcing the "museum" concept literally.

---

## 5. Imagery Style

- **Source material:** classical oil-painting portraits and genre scenes (Renaissance/Baroque style), used both as large hero/section imagery and as small square "avatar-like" crops.
- **Treatment:**
  - Photographic crops are tightly cropped, often bleeding off the edge of their container.
  - A halftone/dot-matrix pattern overlay (in muted blue/green tones) is layered over some images and used as a standalone graphic element (e.g. under the hero portrait, behind card labels) — the recurring "digitization of the analog" visual metaphor: classical art rendered as data.
  - Images inside teal ecosystem cards have a semi-transparent teal color wash over them so the painting reads as part of the brand palette rather than a clashing photo.
  - Small square thumbnails (feedback collage, footer band) are uniformly cropped to head/shoulder portrait framing.
- **Iconography:** minimal; almost no line icons. Visual interest comes from photography and typography, not UI iconography. Social icons in the footer are simple monoline glyphs (X, YouTube, LinkedIn, Instagram) in dark pill/square buttons.

---

## 6. Components

**Buttons**
- Primary: dark pill (`border-radius: 999px`), dark warm-gray/black fill, white/cream text, small padding (e.g. "Request partnership," "Get in touch").
- Secondary: outline or light-fill pill with dark text and a hairline border (e.g. "Explore research," "Join network," "For AI labs").
- Buttons are consistently small/compact relative to headline scale — restraint over prominence.

**Cards**
- *Offering cards* (2×2 grid): full-bleed image, teal color wash, small uppercase eyebrow label top-left, large serif title bottom-left in white. One card in the set is "expanded" with a semi-opaque overlay panel carrying body copy (used for the featured "Benchmarking" card) — a pattern for calling out one item as primary among peers.
- *Stat cards*: white/cream rectangular cards, large light-weight sans numeral + small muted label beneath, arranged in a horizontal row, slightly overlapping the image band above them.
- *Quote card*: mint-colored rectangle with a stack of "papers" drop-shadow behind it (skeuomorphic stacked-card effect), large decorative quotation glyph, serif quote text, small sans attribution line.
- *Tag pills*: small rounded-rect outline chips listing audience segments ("Graphic designers," "Engineers," etc.) on the teal "Connecting with the missing signal" section.

**Section bands**
- Full-bleed color rectangles (mint, teal, forest, dark brown) used as backgrounds for entire viewport-width sections — no rounded corners, hard edges, stacked like blocks of color in a collage.
- Gold ornamental molding graphic as a divider band between sections (unique, one-off decorative flourish).

**Navigation**
- Simple left-aligned wordmark + 3 text links (Offerings / Research / Jobs), right-aligned two-button cluster (secondary outline + primary dark). Sits on the cream background with no visible border/shadow — flat and minimal.

**Footer**
- Brand block (wordmark + one-line description + "Powered by Pilot" credit), link column (Research / Datasets / Jobs), CTA button + social icon row. Bottom-anchored full-width painting image crop as a closing visual flourish, echoing the hero image.

---

## 7. Motion / Interaction Cues (inferred)

Not directly observable from a static capture, but the component patterns imply:
- Pill buttons likely have a subtle hover fill/opacity shift (dark ↔ darker, outline ↔ filled).
- Offering cards likely reveal the overlay/expanded description panel on hover (as seen statically on "Benchmarking").
- Stat numbers are natural candidates for a count-up animation on scroll-into-view.
- Scroll-triggered fade/slide-in for headline blocks, given the deliberate whitespace pacing between sections.

---

## 8. Design Principles Summary

1. **Serif for feeling, sans for function.** Never mix roles.
2. **Color blocks, not gradients.** Every section is a flat, confident color field.
3. **Classical art as data visualization.** Paintings + halftone dot overlays = the visual thesis of "human taste meets AI."
4. **Restraint in UI chrome.** Small buttons, no drop shadows except the one intentional "stacked paper" quote card, no icons unless functionally necessary.
5. **Whitespace as pacing.** Large empty vertical gaps are used deliberately to slow the reader down before a new idea/section.
6. **One decorative flourish per page, not per section.** The gilded frame molding is used exactly once — it stays special because it isn't overused.
