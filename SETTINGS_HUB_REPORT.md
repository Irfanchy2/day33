# Settings Hub redesign: report

## What changed

The long Settings page, with 21 forms stacked on one page, is now a **Settings Hub**.

The **home page** (`/settings`) contains:
- a heading;
- a search box;
- one card per category.

There are no forms on the home page.

**Category pages** (`/settings/<category>`):
- Each category has its own page that can be linked to directly.
- Browser back and forward work.
- Each page shows only that category's settings.
- On a phone there is a clear **← Settings** button at the top.
- On desktop there is a breadcrumb and a side list of all categories, so moving between categories takes one click.
- When a category has three or more sections, a row of chips at the top jumps to each one.

| Card | Settings inside (existing forms, unchanged) |
|---|---|
| Company profile | Company name, trade name, Arabic name (PAID stamp), time zone / currency. Also a link to the logo, address, TRN and bank details. |
| Document branding & layout | Logo, letterheads, footer, stamp, signature, sizes, VAT, TRN, contact details, brand colour, bank details, default wording. Also the Template builder. |
| Quotations, invoices & delivery notes | Document numbering, terms templates |
| WhatsApp & sharing | Free WhatsApp sharing messages, Evolution API, Meta Cloud API, WhatsApp message templates |
| Employees, expenses & approvals | Approval rules, employee portal, company cards |
| Notifications & reminders | Reminder schedule (expiry, overdue, daily summary), notification rules, scheduled reports |
| Users, roles & security | Two-step verification, signed-in devices, sign-in history. Also links to Users & permissions, User activity, Audit log and Trash. |
| Appearance & language | Theme (Light / Dark / Match device), interface language |
| Integrations & advanced | AI & OCR, API & webhooks, public forms, custom fields & statuses |
| Data & backup | Backups, exports, import |

All 21 sections of the old page are still there. They use the same components, fields, save buttons, validation and saved values. Only where they appear has changed. No new database tables or columns were added, and no data was changed.

## Layout on each device

| Screen | Category cards |
|---|---|
| Small phones (under 400 px) | Compact one-column rows |
| Phones from 400 px | Two-column cards |
| Tablets | Two or three columns |
| Laptops and desktops | Three columns, four on very wide screens |

- Nothing scrolls sideways on any category page; this was checked at 412 px.
- The mobile bottom bar and the desktop sidebar are unchanged.
- Light and dark mode are both supported.

## Search

Search covers category names, setting names and keywords; for example "letterhead", "company logo", "IBAN", "WhatsApp", "numbering", "dark mode" and "roles". Each result opens the right category at the right section, and Enter opens the top result.

- Results only include settings the person is allowed to open.
- When nothing matches, an empty-state message is shown.

## Safety

- **Permissions are checked on the server.** A category a role may not use returns a 404. It is not just hidden. An accountant, for example, sees only Security, Appearance and Data.
- **Unsaved edits are protected.** Leaving a page with an edited, unsaved form asks first. Closing or reloading the tab asks too.
- **Old links still work.** Links such as `/settings#branding`, including links in existing notifications, open the new category page at the right section.
- **Saving works as before.** Save actions now refresh all Settings pages.
- **Companies stay separate.** Each company sees only its own settings.

## Tests (all run on a production build)

- **Type check:** clean.
- **Unit tests:** 337 passed and 2 skipped. This includes new checks of the settings catalog and the search.
- **New Settings Hub end-to-end test:** 60 of 60 passed. It checks:
  - layouts at 360, 412, 820, 1024 and 1440 px;
  - search, old links, saving, the unsaved-changes warning and theme switching;
  - role limits (an accountant gets a 404 on admin categories) and company isolation.
- **Full end-to-end suite:** every module passes. The one exception is a random React #418 "hydration mismatch" on a page this change doesn't touch: one check in Share and one in the QA sweep. The same warning appears when the suite runs on `main` (there it was on Stock), so it is an existing intermittent problem.

## Fix found while testing

A loading skeleton for the category pages made about 1 in 4 saves made from dialogs hang. Examples were "Add webhook", "Create API key" and "Schedule a report". After removing it, a 16-save loop failed 0 times, and the skeleton stays removed.
