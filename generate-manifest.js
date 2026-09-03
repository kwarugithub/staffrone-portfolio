/**
 * generate-manifest.js
 * ---------------------------------------------------------
 * Scans assets/work-photos for image files and rewrites
 * gallery.json to match — automatically, no manual editing.
 * Also updates the copy of that JSON embedded directly in
 * index.html (inside <script id="gallery-data">), which is
 * what the page actually reads from — that's what lets the
 * gallery work when you just double-click index.html, with
 * no local server required.
 *
 * USAGE:
 *   node generate-manifest.js
 *
 * Run this once after dropping new photo(s) into
 * assets/work-photos/, then just refresh the page.
 *
 * Existing entries keep their title/sub captions exactly as
 * you wrote them. Brand-new photos get a placeholder title
 * derived from the filename and an empty sub — open
 * gallery.json afterward and fill those in, then re-run this
 * script to push the captions into index.html too.
 * ---------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const PHOTOS_DIR = path.join(__dirname, "assets", "work-photos");
const MANIFEST_PATH = path.join(PHOTOS_DIR, "gallery.json");
const HTML_PATH = path.join(__dirname, "index.html");
const VALID_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function loadExistingManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch (err) {
    console.warn("Could not parse existing gallery.json, starting fresh.");
    return [];
  }
}

function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`Folder not found: ${PHOTOS_DIR}`);
    console.error("Create assets/work-photos and drop your images in there first.");
    process.exit(1);
  }

  const existing = loadExistingManifest();
  const existingByFile = Object.fromEntries(existing.map((e) => [e.file, e]));

  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => VALID_EXT.includes(path.extname(f).toLowerCase()))
    .filter((f) => f !== "gallery.json")
    .sort();

  const manifest = files.map((file) => {
    if (existingByFile[file]) return existingByFile[file];
    // New photo — friendly placeholder title, edit gallery.json anytime
    const niceName = file
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ");
    return { file, title: niceName, sub: "" };
  });

  const manifestJson = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(MANIFEST_PATH, manifestJson + "\n");
  console.log(`gallery.json updated — ${manifest.length} photo(s) listed.`);

  updateEmbeddedCopy(manifestJson);
}

function updateEmbeddedCopy(manifestJson) {
  if (!fs.existsSync(HTML_PATH)) {
    console.warn("index.html not found — skipped updating the embedded copy.");
    return;
  }

  const html = fs.readFileSync(HTML_PATH, "utf-8");
  const re = /(<script id="gallery-data" type="application\/json">\n)([\s\S]*?)(\n\s*<\/script>)/;

  if (!re.test(html)) {
    console.warn(
      'Could not find <script id="gallery-data"> in index.html — skipped updating the embedded copy. ' +
      "The gallery will keep showing its previous photos until this block is fixed."
    );
    return;
  }

  const updated = html.replace(re, (_, open, _old, close) => open + manifestJson + close);
  fs.writeFileSync(HTML_PATH, updated);
  console.log("index.html gallery data updated to match.");
}

main();
