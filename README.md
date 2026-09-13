# VOIR Homepage

Premium brand homepage for **VOIR** — converted from the supplied design reference into semantic HTML5, custom CSS3, and vanilla JavaScript with GSAP animations.

## Quick start

Open `index.html` in a browser, or serve locally:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

## Project structure

```text
VOIR/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   ├── images/          # Section image placeholders (.svg)
│   └── logo/
│       ├── voir-logo.png          # Original logo asset
│       ├── voir-logo-orange.png   # Transparent orange mark
│       └── voir-logo-white.png    # White mark for dark / orange surfaces
└── README.md
```

## Technology

- HTML5 (semantic sections)
- Custom CSS3 (design tokens via CSS variables — no frameworks)
- Vanilla JavaScript
- GSAP 3 + ScrollTrigger (official CDN only)

## Sections

1. Hero  
2. Our Purpose  
3. Product Range (Core / Zenith / Vantage)  
4. Technology  
5. Experiences  
6. Design Philosophy  
7. Why VOIR  
8. Technology Story  
9. Moments That Matter  
10. Vantage Announcement  
11. VOIR Care  
12. Brand Film CTA  
13. Footer  

## Hero slider

The top hero is a 3-slide GSAP banner.

- **Edit copy & images:** `index.html` — search for `HERO SLIDER`
- **Slide images:** `assets/images/hero-slide-01.jpg` … `hero-slide-03.jpg`
- **Timing:** `js/main.js` — `HERO_CONFIG.autoplayMs` / `duration`
- **Logo:** `assets/logo/voir-logo-white.png`

Header nav: Product · Innovation · About · Support · Contact

## Replacing images

Placeholder SVG files live in `assets/images/`. Swap them for final photography using the same filenames (or update the `src` paths in `index.html`). HTML comments mark each replaceable asset.

Suggested final names:

- `hero.webp`, `purpose.webp`, `core.webp`, `zenith.webp`, `vantage.webp`
- `technology.webp`, `cinema.webp`, `sports.webp`, `gaming.webp`, `music.webp`, `family.webp`
- `design.webp`, `technology-story.webp`, `lifestyle.webp`, `vantage-announce.webp`, `footer-cta.webp`

## Logo

The official VOIR logo is used in the header, brand CTA, and footer. White transparent versions are used on dark and orange backgrounds so the mark stays crisp.

## Notes

- Mobile hamburger menu, smooth in-page navigation, newsletter email validation, and keyboard-accessible controls are included.
- Animations respect `prefers-reduced-motion`.
- The page remains readable and usable if JavaScript or GSAP fails to load.
- Individual sections are modular for later redesign without restructuring the whole page.
