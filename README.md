# TSCO corporate gifts landing page

Responsive Persian/RTL redesign with a bundled variable Persian font, photographic concept artwork, inline SVG icons, product galleries, category filters and a live box studio. No npm dependencies or build required.

## Run and export

- Node.js 24: `npm start` from `/workspace/Tsco` (port 3000, override with `PORT`).
- Syntax validation: `npm run check`.
- Portable HTML: `npm run export` (Python 3, standard library only). Creates `/workspace/tsco-landing.html` with all imagery, font, styles and JavaScript embedded; it works offline in a modern browser. Optionally call `python3 scripts/export_html.py /your/output.html`.
- The font and images are retained files. The web-server process must restart in a restored environment.

## Implemented interactions

Category filtering; bundle photo galleries; preset-to-custom-box transfer; up to four products selected by click or drag/drop; box colors; local brand name/logo preview (PNG/JPEG/WebP up to 3 MB); quantity and indicative pricing; box-summary download; validated local review storage; downloadable consultation request; sample HTML guide; FAQ accordions; responsive navigation and accessible native dialogs.

## Content and production status

The linked official TSCO page and competitor domains were blocked by the environment network policy (HTTP CONNECT 403), so their current products, contacts, prices, video and catalog could not be verified. No website-derived data is claimed. Copy is based on the user's supplied TSCO brief and screenshot, with generic product categories. The TSCO wordmark is typeset, not an extracted official logo asset.

All artwork under `assets/*.webp` is generated conceptual imagery and does not identify actual TSCO models or completed customer projects. Prices are explicitly indicative and bundles are proposed combinations; obtain real model specifications, prices, minimum quantities, stock, warranty and fulfillment conditions before production. Country of manufacture must be checked per product; an Iranian brand does not imply every item is made in Iran. Client logos, testimonials, event schedules and official video/catalog await approved material. No invented customer endorsements or satisfaction percentages are included.

Forms do not submit to a backend: they download a text request for manual follow-up through the official website. Reviews remain local and unverified. A backend, moderated review system and approved catalog/media are required before public launch. The generated guide is clearly a sample guide, not TSCO's official catalog.

Font: official Vazirmatn variable WOFF2 from `rastikerdar/vazirmatn` on GitHub, SIL OFL 1.1 license in `assets/fonts/OFL.txt`. All page resources are local; no external runtime requests are needed.
