# Wishing Well — UruaLabs Integration Guide

## Files to add to your GitHub repo

### 1. Add `wishing-well.html` (included in this package)
Upload it to the root of `samsagewize/UruaLabs` — same level as `index.html` and `pingwin.html`.

---

## 2. Update `index.html` — Add "Wishing Well" nav link

Find your existing navigation in `index.html` and add a link to `wishing-well.html`.

The nav link to add (match the style of your existing nav links):

```html
<a href="wishing-well.html">Wishing Well</a>
```

---

## 3. Update `pingwin.html` — Add nav link there too

Same as above — find the nav in `pingwin.html` and add:

```html
<a href="wishing-well.html">Wishing Well</a>
```

---

## File structure after integration

```
UruaLabs/
├── index.html          ← add Wishing Well nav link
├── pingwin.html        ← add Wishing Well nav link  
├── wishing-well.html   ← NEW — upload this file
├── api/
└── (images)
```

---

## The wishing-well.html features

- Cinematic P5-style canvas animation: descend through a realistic stone well tunnel → splash → BTC emerges → UI fades in
- Two tabs:
  - **Cast a Wish** — file upload + text, wallet connect (Xverse / UniSat), fee breakdown
  - **Inscriptions** — all past inscriptions with ✓ checkmark for registered ones
- Registered inscriptions show green ✓ + "Marketplace ✓" pill
- Unregistered show a muted dot indicator
- Registry opt-in sends 2,000 sats to `3FxKYyYJcxn6Tx2RvQM8szTzYKTQYskgWq` silently
- All inscriptions stored in localStorage and indexed with `app: "bitcoin-wishing-well-v1"` for future chain indexing
- After successful inscription, auto-switches to Inscriptions tab to show the new entry
- Fully responsive, mobile-friendly
- Matches UruaLabs dark gold aesthetic

---

## Deploy via GitHub Pages

Your site at `urualabs.com` is likely served via GitHub Pages. After uploading `wishing-well.html`, it will be live at:

```
https://urualabs.com/wishing-well.html
```

or if using a custom domain config:

```
https://www.urualabs.com/wishing-well.html
```
