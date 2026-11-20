# Vixen Comix

The website for Vixen Comix (https://vixencomix.art): a hub for The Vale of Wales, Le Monstre Social and The War Dolls. It is a React 19 + Vite single-page app that runs on plain static hosting (IONOS), so there is no server to maintain.

## Commands

Run these in this folder (`vixen-comix/`).

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies (once, and after pulling changes). |
| `npm run dev` | Starts the local site at http://localhost:5173 with live reload. |
| `npm run build` | Builds the site into `dist/`. |
| `npm run preview` | Serves `dist/` at http://localhost:4173 to check a build. |
| `npm run lint` | Checks the code with oxlint. |
| `npm test` | Runs the unit tests (Node's built-in test runner). |

Copy `.env.example` to `.env` to set optional values. `.env` is ignored by git.

## Adding a comic, chapter or pages

All comics, chapters and pages come from one file: `public/comics.json`. No code changes and no rebuild are needed to publish new pages: put the images on the server and upload the updated `comics.json`.

Fields:

| Field | Where | Meaning |
|---|---|---|
| `slug` | comic, chapter | Used in the web address. Letters, numbers, `-` and `_` only. Must be unique (chapters: unique inside the comic). |
| `title` | comic, chapter | Shown to readers. |
| `status` | comic | `ongoing`, `complete` or `coming-soon`. A `coming-soon` comic shows a "Coming soon" badge and has no Read link. |
| `description` | comic | Text on the Comics page and the table of contents. |
| `cover` | comic | Image path under `public/`, or `null` to use the "Coming soon" placeholder. |
| `externalUrl` | comic (optional) | An `https://` link; shows "Also on Tumblr" on the table of contents. |
| `chapters` | comic | List of chapters. |
| `pages` | chapter | List of image paths under `public/`, in reading order. An empty list shows the chapter as "(Coming Soon)". |

Page numbers are positions in the `pages` list (the first image is page 1). A page is read at `/<comic slug>/<chapter slug>/page-<number>`, for example `/vale-of-wales/chapter-1/page-5`.

Example: publish Chapter 3.

1. Put the images in `public/vale-of-wales/chapter-3/` (for example `page-1.jpg`, `page-2.jpg`).
2. In `public/comics.json`, find the `chapter-3` entry of `vale-of-wales` and fill in its pages:

   ```json
   {
     "slug": "chapter-3",
     "title": "Chapter 3",
     "pages": [
       "/vale-of-wales/chapter-3/page-1.jpg",
       "/vale-of-wales/chapter-3/page-2.jpg"
     ]
   }
   ```

3. Check it locally with `npm run dev`, then upload (see below). Spaces in file names are fine, but keep the path in `comics.json` exactly the same as the file name.

To start a new comic, copy one of the `coming-soon` entries, change `status` to `ongoing`, add a `cover` and add chapters.

If `comics.json` has a typo that breaks the JSON, the site shows "Comics are unavailable" instead of a blank page. Entries with a missing or repeated `slug`, or an unknown `status`, are skipped, and the browser console says which.

## Publishing to IONOS

1. Run `npm run build`.
2. Connect to your IONOS web space with an SFTP client.
3. Upload the **contents** of the `dist/` folder into the folder that serves vixencomix.art (not the `dist` folder itself). Replace existing files.
4. Make sure the hidden file `.htaccess` was uploaded too. Most SFTP clients need "show hidden files" turned on. Without it, refreshing a page such as `/comics` returns a 404.
5. Check a deep link: open https://vixencomix.art/vale-of-wales/chapter-1/page-5 directly, then press refresh. The page image should load both times.

When you only add pages, you can skip the build: upload the new images and `comics.json`.

`.htaccess` also sets basic security headers and caching (`index.html` and `comics.json` are always re-checked, so new pages show up right away). It has a commented-out block that forces HTTPS. Remove the `#` signs on those lines once the IONOS SSL certificate is active.

## Notes

- Styling is plain CSS: `src/App.css` (the original design) and `src/hub.css` (comics pages). Tailwind is not used; classes such as `container mx-auto` in older pages do nothing.
- The Contact form only appears when `VITE_CONTACT_API_URL` points at a service that accepts the form data. Until then the page shows a short notice.
- Reader accounts (saving your reading spot) use Supabase. Setting that up is the next section of this README.
