# FurniAI — AI-Powered Furniture Design Platform

> **Design Smart Furniture with AI** — Free, open, and production-ready.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key (optional)

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Add environment variable: `OPENAI_API_KEY` (optional — app works without it)
5. Click **Deploy**

Your app will be live at: `https://furni-ai.vercel.app`

### Custom Domain (furniai.com)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add `furniai.com` and `www.furniai.com`
3. Update your DNS records:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`
4. Wait for SSL certificate (automatic)

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI generation. Without it, smart fallback is used |

Create `.env.local`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

## 📦 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai-generate` | POST | AI-powered furniture generation from text description |
| `/api/export` | POST | Factory-ready production spec (mm precision) |
| `/api/save` | POST | Save a design to server |
| `/api/designs` | GET | Load all saved designs |

## 🏗️ Project Structure

> **Note on architecture:** the `/builder` page implements its own Three.js scene
> management directly (raw `WebGLRenderer`/`Scene`/render loop in `page.js`) rather
> than going through `FurnitureCanvas`/`FurnitureModel`/`generateFurniture.js`. Those
> components remain in use elsewhere (e.g. lighter-weight previews), but the builder's
> parametric models (wardrobe, kitchen, office, TV wall, cabinet, bed, shelving unit,
> dressing table, etc.) are built and rebuilt straight from React state inside
> `app/builder/page.js`.

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── ai-generate/  # OpenAI integration
│   │   ├── export/       # Factory spec generator
│   │   ├── save/         # Save design
│   │   └── designs/      # Load designs
│   ├── builder/          # AI Builder (main feature)
│   ├── gallery/          # Design gallery
│   ├── dashboard/        # Saved designs
│   ├── pricing/          # Free pricing
│   ├── about/            # Company info
│   └── contact/          # Contact form
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── TextureSelector.jsx   # Texture picker
│   └── three/
│       ├── FurnitureCanvas.jsx
│       └── FurnitureModel.jsx
├── lib/
│   ├── generateFurniture.js  # 3D parametric generator
│   └── factoryExport.js      # Production spec system
└── store/
    └── furnitureStore.js     # Zustand state
```

## 🛋️ Supported Furniture

- **Wardrobe** — Frame, shelves, doors with handles
- **Sofa** — Rounded cushions, armrests, fabric materials
- **Table** — Rounded top, cylinder legs, cross supports
- **Kitchen** — Upper/lower cabinets, marble countertop, fridge slot, drawers
- **Office** — Desk, cabinet, LED lighting, fully interactive configurator
- **TV Wall Unit** — Floating media console, frameless screen, optional LED backlight glow and floating display shelves
- **Cabinet** — Carcass with metal/wood/no legs, optional open-top display compartment, configurable drawer rows
- **Bed** — Single/double/queen/king sizes, four headboard styles, optional under-bed storage and LED glow strip
- **Shelving Unit** — Open, ladder, or cube layouts with adjustable shelf count and optional back panel
- **Dressing Table** — Configurable drawers, round/rectangular/no mirror, optional matching stool

## 🏭 Factory Export

The export system generates mm-precision specs including:
- Component breakdown (every panel, shelf, door)
- Hardware list (hinges, drawer slides, handles)
- Assembly instructions
- Material & finishing notes
- Kitchen-specific: appliance slots, countertop specs

## 📝 License

MIT — Free for personal and commercial use.
