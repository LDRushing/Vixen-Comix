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
- Link previews: the page title, description and image used when someone shares a link on Discord, X or Tumblr are the same for every page (they are set once in `index.html`). Previews that show the specific comic or page would need each page prerendered. That is a possible later step; say if you want it.
- The comic images, `comics.json` and everything else in `dist/` are public. Only the Supabase Project URL and the publishable key (see below) ever go into the site.

## Reader accounts with Supabase

Readers can create an account (Google, or email and password), press **Save my spot** while reading, and come back later from the **Continue Reading** page. Each reader has one saved spot per comic plus a reading history that only feeds their own list. Everyone can still read without an account.

Without the steps below the site works normally: the Login and Register pages say "Sign-in is unavailable right now", the forms are disabled and the reader shows a disabled "Sign-in unavailable" button.

The code is finished; the steps below are the parts only you can do, because they need your Supabase, Google and IONOS accounts. The migration SQL has not been run against a real project yet. Screen labels in the Supabase dashboard change from time to time, so if a name below does not match, look for the closest one. The official guides are linked in each step.

### 1. Create the Supabase project

1. Sign up or log in at https://supabase.com/dashboard and choose **New project** (the free plan is enough).
2. Pick a name (for example `vixen-comix`), a region near your readers and a database password. Save the database password in a password manager. The site never needs it.
3. Wait for the project to finish starting. The short code in its address (`https://<project-ref>.supabase.co`) is your **project ref**.

### 2. Create the tables

1. In the project, open **SQL Editor** and start a new query.
2. Open `supabase/migrations/0001_reading_progress.sql` from this folder, copy all of it into the editor and choose **Run**. It should finish with "Success". It is safe to run twice.
3. Open **Table Editor**. The tables `bookmarks` and `reading_history` should be there, each marked as having Row Level Security (RLS) enabled with four policies.

### 3. Turn on email sign-in with confirmation

1. Open **Authentication**, then **Sign In / Providers** and open **Email**.
2. Make sure Email is enabled and **Confirm email** is **on**. New accounts then have to click the link in an email before they can log in.
3. Leave the minimum password length at 8 or more (the site asks for at least 8 characters).

Guide: https://supabase.com/docs/guides/auth/passwords

### 4. Turn on Google sign-in

1. In Google Cloud (https://console.cloud.google.com), create or pick a project, then open **Google Auth Platform**.
2. Under **Branding**, **Audience** and **Data Access**, set the app name, make the app available to any Google account (External), and make sure the scopes `openid`, `.../auth/userinfo.email` and `.../auth/userinfo.profile` are listed.
3. Under **Clients**, choose **Create client** and pick **Web application**.
   - **Authorized JavaScript origins**: add `https://vixencomix.art` and, for local testing, `http://localhost:5173`.
   - **Authorized redirect URIs**: add `https://<project-ref>.supabase.co/auth/v1/callback` (use your own project ref; Supabase also shows this exact address as **Callback URL** on its Google provider page).
4. Create the client and copy the **Client ID** and **Client secret**.
5. Back in Supabase open **Authentication**, **Sign In / Providers**, **Google**. Switch it on, paste the Client ID and Client secret there, and save. The secret goes only into this Supabase screen. Never put it in `.env`, in code or in a chat.

Guide: https://supabase.com/docs/guides/auth/social-login/auth-google

### 5. Send the emails from your own address (IONOS SMTP)

Supabase's built-in email sender only mails people on your Supabase team and is capped at a few emails per hour, so it cannot send confirmation emails to readers. Use your IONOS mailbox instead.

1. In Supabase open the SMTP settings (Authentication, Emails, **SMTP Settings**; direct link: https://supabase.com/dashboard/project/_/auth/smtp) and switch on **Enable custom SMTP**.
2. Fill in:
   - **Sender email address**: `faeriecongress@vixencomix.art`
   - **Sender name**: `Vixen Comix`
   - **Host**: `smtp.ionos.com` (IONOS uses other hosts in some regions, for example `smtp.ionos.co.uk`, `smtp.ionos.de`, `smtp.ionos.es` or `smtp.ionos.fr`. Use the one shown in your IONOS email settings.)
   - **Port number**: `587`
   - **Username**: the full mailbox address, `faeriecongress@vixencomix.art`
   - **Password**: the mailbox password. Type it only into this Supabase screen. It is never stored in this repo.
3. Save, then raise the sending limit on the **Rate Limits** page if you expect many sign-ups (Supabase starts custom SMTP at a low hourly limit).
4. Test: register with an email address you own and check that the confirmation email arrives (also look in the spam folder).

Guide: https://supabase.com/docs/guides/auth/auth-smtp

### 6. Tell Supabase which web addresses are allowed

1. Open **Authentication**, then **URL Configuration**.
2. **Site URL**: `https://vixencomix.art`
3. **Redirect URLs**: add `https://vixencomix.art/**` and `http://localhost:5173/**`.
4. Save. Without this, confirmation and password-reset links and Google sign-in send readers to the wrong place.

Guide: https://supabase.com/docs/guides/auth/redirect-urls

### 7. Put the two public values into the site

1. In the Supabase dashboard open the **Connect** dialog or **Project Settings**, **API Keys**. Copy the **Project URL** and the **Publishable key** (it starts with `sb_publishable_`). Projects created earlier call this the `anon` key; that one works too.
2. In this folder, copy `.env.example` to `.env` and fill in:

   ```
   VITE_SUPABASE_URL=<your Project URL>
   VITE_SUPABASE_ANON_KEY=<your publishable key>
   ```

   (The variable is called `ANON_KEY` for historical reasons; it takes the publishable key.)
3. **Never** use the `secret` key or the `service_role` key anywhere in this site. They bypass all privacy rules. Only the Project URL and publishable key belong in `.env`.
4. Run `npm run build`. The values are baked in at build time, so rebuild whenever you change them.
5. Upload the contents of `dist/` to IONOS as described above (include `.htaccess`).

### 8. Check privacy with two accounts

Do this once after the first upload, with two different email addresses (call them A and B).

In the site:

1. Register and confirm account A. Log in, open `/vale-of-wales/chapter-1/page-5`, choose **Save my spot**, then read two more pages and wait two seconds on each.
2. Open **Continue Reading**: A's saved spot (Chapter 1, page 5) and recently read list are there.
3. Log out. Log in as B. **Continue Reading** must show no saved spots and nothing recently read.

Directly against the database (this proves the rule holds even for someone who skips the website):

1. Log in as B in a browser, open the developer tools, **Application** (or **Storage**), **Local Storage**, and copy the `access_token` inside the entry named `sb-<project-ref>-auth-token`. Treat it like a password and do not share it.
2. Run (replace the three placeholders):

   ```
   curl "https://<project-ref>.supabase.co/rest/v1/bookmarks?select=*" \
     -H "apikey: <publishable key>" \
     -H "Authorization: Bearer <B's access_token>"
   ```

   Expected result: `[]`. B must not get A's row.
3. Run the same command without the `Authorization` line (that is a signed-out visitor). Expected result: a permission error, not data.
4. Repeat steps 2 and 3 with `reading_history` in place of `bookmarks`.

If B ever sees A's data, take the site offline (or upload a build made without the Supabase values), then check in **Table Editor** that RLS is enabled on both tables and that each has its four policies.

### Privacy

- A reader's saved spots and history can only be read or changed by that reader (Row Level Security, enforced by the database, not by the website).
- The history is used only to build that reader's own Continue Reading list. It is not shared, counted or analysed.
- Readers are stored by Supabase Auth (email address, and the Google account id for Google sign-in). Deleting a user in **Authentication**, **Users** also deletes their saved spots and history.
- Mention accounts in a short privacy note on the site if you want to be transparent about it; say if you would like one added.

### Trying accounts without Supabase (development only)

Putting `VITE_USE_MOCK_SUPABASE=true` in `.env` and running `npm run dev` swaps in a fake in-browser Supabase that keeps data in the browser's localStorage under `vc.mock.*`. It lets you click through register, login, Save my spot and Continue Reading without any account. Registering does not send an email in this mode: the account works straight away, but the page shows the same "Check your email" message. The mock is left out of `npm run build` completely, so it can never ship.

### Open points

- **Contact form**: it still has nowhere to send messages (the old backend is gone). It needs a small service or form provider; until `VITE_CONTACT_API_URL` is set the page shows a notice.
- **Link previews** are the same for every page (see Notes above).
- **Figma**: when your Figma designs are available again, send screenshots and the page styling can be matched to them.
