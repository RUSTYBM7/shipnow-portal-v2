# ShipNow Portal — AirPak Express

Customer-facing portal for AirPak Express (a global shipping/logistics platform). Lets users create shipments, track packages, manage payments, and earn rewards.

## Stack

- **Build:** Vite 6
- **UI:** React 18 + TypeScript + Tailwind CSS v3
- **Routing:** React Router 6
- **State:** Zustand stores (`useAppStore`, `useShipmentsStore`, etc.)
- **Auth & DB:** Supabase (`@supabase/supabase-js`)
- **Maps:** MapLibre GL
- **PDF:** jsPDF
- **PWA:** Service worker + manifest

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment variables

Create a `.env`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

## Project layout

```
src/
  components/      shared UI (brand, layout, support chat, etc.)
  contexts/        AuthContext
  features/        domain features
    auth/          login / register / forgot / admin sign-in
    shipment/      CreateShipmentForm, ShipmentsPage
    payments/
    admin/
    map-tracking/
    logo-engine/
    chat/
    ai-*/
  hooks/
  lib/             supabase client, store helpers
  pages/
  stores/
  styles/
  utils/

public/            static assets, manifest, icons
supabase/          Supabase SQL schema + edge functions
```

## Deployment

Built as a static SPA in `dist/`. SPA rewrites are configured in `vercel.json`.

## License

Proprietary — internal AirPak Express tool.
