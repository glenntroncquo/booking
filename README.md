# Salonify Booking

Public booking site for `booking.salonify.co`.

Visitors open `/{companyId}` and see the booking widget embedded via iframe.

## Routes

- `/` — 404 (no landing page)
- `/{companyId}` — booking page (embeds the widget iframe)
- `/{companyId}?staff={uuid}` — optional preselected staff member(s)

## Development

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/{company-uuid}`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WIDGET_DOMAIN=https://booking-widget-nine.vercel.app  # widget deployment
```
