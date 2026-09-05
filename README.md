# Salonify Booking

Public booking site for `booking.salonify.co`.

Visitors open `/{companyId}` and see the booking widget embedded via iframe.
This repo does **not** query booking-domain tables and does **not** call
`service-list`, `availability-list`, `appointment-create`,
`appointment-cancel`, or `appointment-list`. Those folded v1 slugs live in
[`booking-widget`](https://github.com/glenntroncquo/booking-widget). This site
never used the additive `*-v2` slugs and does not call `treatment-list`.

The only Supabase call here is `company-get`, for public company metadata (SEO /
404).

There is no npm embed package to pin — the widget is loaded by URL
(`NEXT_PUBLIC_WIDGET_DOMAIN`).

## Routes

Path segments accept a company / location / staff **uuid or slug**. The host
resolves the company via `company-get` and forwards location/staff keys to the
widget (`locationId` / `locationSlug`, `staffIds` / `staffSlugs`). The widget
resolves location and staff. No booking-domain RPCs are added here.

- `/` — 404 unless `?companyId=` or `?companySlug=` (redirects to `/{company}`)
- `/{company}` — company booking page (no location; widget shows a location
  picker when the company has more than one)
- `/{company}/{location}` — location-scoped booking page
- `/{company}/{location}/{staff}` — location + staff preselect
- `/{company}?staff={uuid}` — optional staff preselect without a location
- `/{company}?serviceIds={uuid}&serviceVariantIds={uuid}` — optional service /
  variant preselection forwarded to the widget (`serviceIds` /
  `serviceVariantIds` only; no `treatmentId` / `priceOptionId` aliases)

### Test URL examples

```
/{company-uuid}
/{acme-salon}
/{acme-salon}/{ghent}
/{acme-salon}/{location-uuid}
/{acme-salon}/{ghent}/{anna}
/{acme-salon}/{ghent}/{staff-uuid}
/{company-uuid}/{location-uuid}/{staff-uuid}
/{acme-salon}/{ghent}?serviceIds={service-uuid}
```

The former `/{company}/{staff}` staff deep-link is unused in production and is
now the location route. Staff preselect is `/{company}/{location}/{staff}`.

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
