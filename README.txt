EMBER & BUN — premium scroll-animated burger café website (static)
==================================================================
Run locally:  any static server from this folder, e.g.  npx http-server -p 8080   (or VS Code Live Server)
              Opening index.html directly via file:// also works in most browsers.

Structure
  index.html                 all sections / copy
  assets/css/style.css       design tokens at the top (:root colours, fonts)
  assets/js/app.js           SIGNATURES + MENU data at the top; all animation logic below
  assets/vendor/             GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13 (self-hosted, no CDN)
  assets/seq/hero/d|m/       498-frame WebP scroll film (desktop 1920w / mobile 720x1080 portrait crop): original 311 frames + two AI clips spliced in (burger assembly after the griddle, packing into the crimson box at the end)
  assets/video/sear.mp4      seamless loop for the "Slow sear" section (900w, 1.5 MB)
  assets/img, assets/menu    WebP photos and transparent burger cut-outs

Sections
  1 Preloader (frame-gated, never blocks > 8 s)   2 Hero scroll film: rooftops > street > café door > griddle > burger,
  with 6 typographic beats + chapter rail          3 A corner, not a chain (parallax collage, line-drawn burger)
  4 Velocity marquee   5 Menu: signature cards (tilt, fly-to-cart), tabbed board with hover image peek
  6 Slow sear (pinned video + sliding card, counters)   7 It's 4 PM (pinned horizontal day gallery)
  8 Visit / book a table   9 Footer giant wordmark

Performance
  - Canvas image sequence (not video seeking): frames kept compressed in memory, a sliding window of
    ~44 off-thread-decoded ImageBitmaps around the playhead (direction-aware prefetch), no ghost blending
  - Frames re-timed by measured optical motion so camera speed stays constant across the 5 AI clips
  - Separate portrait frames for phones; lazy images; video preload=none & plays only in view
  - Total weight ~70 MB (desktop film 50 MB, mobile film 19 MB; each device loads only its own), first paint ~4 MB; prefers-reduced-motion respected

WooCommerce port
  - Page template + enqueue style.css/app.js; assets in theme
  - MENU/SIGNATURES -> WC products (loop); [data-add] click -> POST /wp-json/wc/store/v1/cart/add-item
  - Book-a-table form -> CF7 / booking plugin
