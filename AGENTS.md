# AI Event Registration Module — Agent Notes

## Project overview
- Single-page, offline registration form that generates a QR code containing the registrant data.
- Two flows: Adult and Child.
- Frontend only: index.html + pp.js + libs/qrcode.min.js.

## How to run
- Open index.html directly in a browser (no server required).
- For phone testing on the same Wi-Fi, run 
ode server.js and open the printed local IP URL on your phone.
- QR generation depends on libs/qrcode.min.js being present.

## Data / QR format
- Adult QR format:
  dult,first,last,phone,email,age_range,nationality,emirate
- Child QR format:
  child,parent_first,parent_last,phone,email,nationality,emirate, child_name,child_age_range, ... , [parent_participant,parent_age_range]
- Commas are not allowed inside field values; they are replaced with spaces in pp.js.

## Main logic locations
- UI and layout: index.html
- All behavior, validation, QR generation: pp.js
- QR library: libs/qrcode.min.js (minified)
- QR display page: qr.html + qr.js
- Local test server: server.js

## Current behavior (latest)
- Branding updated to SIB palette (#001489, white, accent #ff8200).
- Logo is shown on registration page header and QR page card.
- Registration header title/subtitle removed per latest UI direction.
- Terms & Conditions checkbox is mandatory; form field validation runs before T&C check.
- Nationality UX split by device:
  - Mobile (<= 720px): searchable fuzzy list with keyboard-friendly input.
  - Desktop (> 720px): native dropdown select.
- Validation/error messages display below the form section (not at card top).
- QR page buttons are stacked full width.
- QR display is responsive: defaults to 300px but scales down on smaller screens.
- Downloaded QR image keeps a white frame for scan reliability in dark mode.

## Session handoff (2026-02-16)
- Multiple UI and UX refinements were implemented and pushed to:
  https://github.com/mhmdharb12/millionaireregistration (branch master).
- Vercel deploys are configured as auto-deploy from master.

## Change guidelines
- Keep QR text format stable; it must match the main system parser.
- Avoid commas in user fields; if adding new fields, preserve the delimiter handling.
- If adding dependencies, keep the project offline-capable.
