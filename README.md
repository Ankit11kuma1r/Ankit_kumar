# FarmPure Premium Milk Website

This website is built for a premium milk business that delivers lab-tested, 99.99% chemical-free milk directly from farms.

## Features

- Hero section with farm cows milk background and a clear call to action.
- `Order Now` button opens the order form in a popup modal.
- Spin-to-win discount game to attract customers (discount applied to monthly bill).
- Clickable feature actions:
  - `Lab-Tested Quality` scrolls to milk-testing equipment image section.
  - `Direct from Farms` scrolls to farmer success stories with images.
  - `Subscription Convenience` opens location popup and auto-fills delivery address with latitude and longitude.
- Full order form to capture customer requirements and place orders.
- Owner dashboard to view all incoming orders.
- Order persistence in `data/orders.json` and owner email notification attempt via local `sendmail`.

## Run locally

```bash
npm start
```

Open:

- Website: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`

## Environment variables

Optional:

```env
PORT=3000
OWNER_EMAIL=ankit11kuma1r@gmail.com
```

If `sendmail` is not installed, order notifications are skipped, but orders are still saved and visible in dashboard.
