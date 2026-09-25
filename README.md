# Beta Matric Hr. Sec. School: Website Redesign

A single-page, responsive, animated redesign of https://betamhss.in/. It uses the school's real content, photos and PDFs.

## Run it
It is a static site with no build step. Open `index.html` directly, or serve the folder:

```
python -m http.server 5500   # then open http://localhost:5500
```

It can be deployed as-is to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Structure
```
index.html            all sections
assets/css/style.css  design tokens, components, responsive, dark mode
assets/js/main.js     interactions (vanilla JS, no libraries)
assets/img/           school photos (from the current site)
assets/pdf/           topper lists 2024–25, environment poster
```

## Problems on the current site, and how this fixes them
| Current site | Redesign |
|---|---|
| Template leftovers: a shopping cart ("brown jacket $15"), a login/sign-up modal, a stray "$60" price, "Welcome To Junior Home" | All removed. Only the school's content remains |
| Lorem ipsum text in the gallery and on the rules page | Real captions, plus a filterable gallery with a lightbox |
| Dead `#` links and an empty "Payment Gateway" button | Every link works: online application, fee portal, call, email and map |
| The same copied bio under all 6 trustees, and the principal shown with the wrong photo | Correct photo, degrees and role for each person |
| Fake Facebook/Pinterest/Twitter icons | Removed |
| Desktop-first layout | Mobile-first design tested at 320, 390, 820 and 1440px, with no horizontal scroll |
| Content spread over many thin pages | One page with sticky nav, scroll-spy and a mobile drawer |
| 30+ rules in one long wall of text | Grouped accordion with **live search** and highlighted matches |
| XI subject groups out of date (4 groups) | 2025–26 groups (5), matching the latest admission poster |
| No clear admission path | 4-step admission guide, age eligibility, document checklist, 25% concession offer and an enquiry form |
| "ISO 9001:2000" | Shown as "ISO 9001" |
| No SEO or social metadata | Meta description, Open Graph tags and `School` structured data (JSON-LD) |
| No accessibility support | Skip link, alt text, keyboard-accessible tabs and lightbox, focus styles, `prefers-reduced-motion` |

## Features
- "35 years" preloader, announcement ticker, scroll progress bar
- Word-by-word headline reveals, clip-path image reveals, count-up stats, animated timeline and result bars
- Hero collage with mouse parallax, rotating "35 years" badge, magnetic buttons
- Draggable facilities carousel (16 highlights)
- Topper tabs (X / XI / XII) with PDF links, world-record spotlight
- Dark mode (follows the OS setting, with a manual toggle that is remembered)
- Floating dock with call and apply buttons and a back-to-top progress ring
- Embedded Google Map, enquiry form (opens an email to betamhss@gmail.com)

## Before going live
- The enquiry form currently opens the visitor's email app (`mailto:`). To collect leads directly, connect it to a form backend (Formspree, Google Apps Script, or the school's own server).
- Swap in higher-resolution photos if the school has them. The current site's images are small (about 370–640px).
- The facility card photos (`class-*.jpg`) are the stock images from the current site. Replace them with real campus photos for more credibility.
