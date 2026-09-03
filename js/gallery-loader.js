/**
 * gallery-loader.js
 * ---------------------------------------------------------
 * Builds the Work Gallery grid from the JSON embedded in
 * index.html (#gallery-data), which is kept in sync with
 * assets/work-photos/gallery.json by generate-manifest.js.
 *
 * Reading from an embedded <script> tag (instead of fetching
 * gallery.json over the network) means this works even when
 * you just double-click index.html — no local server needed.
 *
 * TO ADD A NEW PHOTO:
 *   1. Drop the image file into assets/work-photos/
 *   2. Run:  node generate-manifest.js
 *      (this updates gallery.json AND the embedded copy in index.html)
 *   3. Refresh the page
 *   That's it — no HTML editing.
 *
 * Builds the same figure.gallery-card markup your styles.css
 * already styles, so no visual change other than automation.
 * ---------------------------------------------------------
 */

(function () {
  const GRID_SELECTOR = "#gallery-grid";
  const DATA_SELECTOR = "#gallery-data";
  const PHOTOS_BASE = "assets/work-photos/";

  function loadGallery() {
    const grid = document.querySelector(GRID_SELECTOR);
    if (!grid) return; // section not on this page

    const dataScript = document.querySelector(DATA_SELECTOR);
    if (!dataScript) {
      grid.innerHTML = `<p class="gallery-error">Couldn't load the gallery right now.</p>`;
      return;
    }

    try {
      const photos = JSON.parse(dataScript.textContent);

      grid.innerHTML = photos
        .map((p) => {
          const src = PHOTOS_BASE + p.file;
          const title = escapeHtml(p.title || "");
          const sub = escapeHtml(p.sub || "");
          return `
        <figure class="gallery-card" data-reveal>
          <div class="gallery-card__frame">
            <img
              class="zoomable"
              src="${src}"
              alt="${title}"
              data-full="${src}"
              data-caption="${title}"
              loading="lazy"
            />
          </div>
          <figcaption class="gallery-card__caption">
            <span class="gallery-card__title">${title}</span>
            <span class="gallery-card__sub">${sub}</span>
          </figcaption>
        </figure>
      `;
        })
        .join("");

      // Bind the freshly-created images into the lightbox
      grid.querySelectorAll("img.zoomable").forEach((el) => {
        if (window.LightboxUtil) window.LightboxUtil.bind(el);
      });

      // script.js's initScrollReveal is exposed on window so the
      // newly-added cards get the same scroll-triggered fade-in
      // as everything else on the page, instead of staying hidden.
      if (typeof window.initScrollReveal === "function") {
        window.initScrollReveal(grid);
      } else {
        // Fallback if script.js loaded before this change: just show them.
        grid.querySelectorAll("[data-reveal]").forEach((el) => {
          el.classList.add("is-visible");
        });
      }
    } catch (err) {
      console.error("Gallery failed to load:", err);
      grid.innerHTML = `<p class="gallery-error">Couldn't load the gallery right now.</p>`;
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", loadGallery);
})();
