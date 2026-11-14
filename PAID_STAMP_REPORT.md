# Green PAID stamp: report

## What it does

When a tax invoice is fully paid, a round green PAID stamp now appears on the invoice in four places:

- the invoice page preview
- the print view (`/print/sales/<id>`)
- the PDF (download, Document Vault, customer portal and WhatsApp attachments)
- browser printing

The stamp design:

- deep green `#15803D` on a transparent background
- a double outer border, an inner ring, and a light "worn rubber" texture
- the Arabic company name around the top arc and the English company name around the bottom arc
- the centre reads `DATE: DD-MM-YYYY` above a large **PAID**, with no time anywhere
- the date is the date of the payment that completed the invoice
- no icons, no decorations, and no uploaded image: every letter is a vector outline drawn from the fonts
- Arabic is shaped and joined right-to-left (fontkit) and placed along the arc

The stamp is about 38 mm across. It sits in its own space at the right, under the Paid Amount / Total Balance box, so it never covers text, amounts or the signature. If the box moves to the next page, the stamp moves with it.

## When it shows

- **Shown:** an issued tax invoice that is fully paid, while its stamp switch is on (the default).
- **Hidden:** draft, unpaid, partly paid, cancelled, fully credited, quotations and delivery notes.
- **Goes away by itself:** if a payment is taken off and the invoice is no longer fully paid. It comes back when the invoice is fully paid again.

## Remove or keep, per invoice

On a fully paid invoice, the **Payment** panel shows:

> PAID stamp: shown · on the invoice, its print and PDF, dated 03-11-2026 — **Remove PAID stamp**

After you remove it, the same line offers **Show PAID stamp**.

- Only users who can edit records can switch it.
- Each change is written to the invoice history ("PAID stamp removed" / "PAID stamp shown").
- Nothing else changes: the number, totals, status and payments stay exactly as they are.

## Company names (works for each company)

- **English:** the company name from Settings → Company.
- **Arabic:** a new field, **Settings → Company → Company name in Arabic**, typed right to left. Enter the registered Arabic name exactly as it is on the trade licence.
- **No Arabic name yet:** the English name goes on the top arc and "PAYMENT RECEIVED" on the bottom arc.
- **Long names:** they shrink to fit the ring and never run into the borders.

## Database: one safe, additive migration

`supabase/migrations/0039_paid_stamp.sql`:

- `companies.name_ar text` (nullable, 2–200 characters)
- `invoices.show_paid_stamp boolean not null default true`

Nothing is dropped, renamed or rewritten, and no existing row changes. The migration is safe to run more than once.

The app also works before the migration is run:

- the stamp shows using the English name only
- the switch and the Arabic field explain that the one-time database update is needed

## Tests (run)

- **Unit (vitest):** the full suite passes, 334 passed and 2 skipped. The new `tests/unit/paid-stamp.test.ts` covers:
  - date format
  - deterministic artwork that stays inside the ring
  - long names
  - which invoices get the stamp
  - the switch
  - a database without the migration
  - the paper and the PDF
- **End-to-end (`tests/e2e/invoice-search-paid.mjs`, production build):** 43/43 passed. It checks:
  - the Arabic name is saved in Settings
  - the green round vector stamp with the payment date
  - the stamp covers no text or figures
  - the stamp stays when printing
  - no stamp on partly paid or unpaid invoices
  - the green stamp appears in the PDF
  - Remove / Show updates the preview, print and PDF and changes nothing else
  - taking off a payment removes the stamp and hides the switch

## After merging

1. Run `0039_paid_stamp.sql` in the Supabase SQL editor.
2. Settings → Company: enter the company name in Arabic and save.
3. Reload the app after the deploy.
