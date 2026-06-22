# Salonify Booking

Public booking app for `booking.salonify.co`.

## Routes

- `/` — 404 (no landing page)
- `/{companyId}` — full booking page for a salon (UUID)
- `/widget?companyId={uuid}` — embeddable iframe widget (postMessage API)

## Development

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/{company-uuid}`.

## Embed on salon websites

```html
<iframe
  src="https://booking.salonify.co/widget?companyId=YOUR_COMPANY_ID"
  title="Book appointment"
  style="width:100%;border:none;min-height:600px"
></iframe>
```

Set `NEXT_PUBLIC_WIDGET_DOMAIN=https://booking.salonify.co` on the salon website.
