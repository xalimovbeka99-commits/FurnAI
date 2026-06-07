# FURNI AI — COMPLETE MASTER PLAN & IMPLEMENTATION ROADMAP

## VISION STATEMENT

Furni AI is an end-to-end AI-powered furniture design and production platform. Users describe their furniture needs in natural language. AI generates design options from a catalog of existing 3D models. Users customize dimensions, materials, colors, and hardware in real-time via an interactive 3D builder. The system exports production-ready specifications directly to CNC manufacturing. Zero friction between design intent and factory output.

---

## CURRENT STATE ANALYSIS

**Website:** furn-ai.vercel.app

**Existing Components:**
- Homepage with hero messaging and call-to-action
- Builder page with interactive 3D viewer and parametric controls
- Gallery page with static furniture catalog (9 items across 8 categories)
- Pricing page (all free tiers)
- Navigation structure and footer

**Existing 3D Assets:**
- Wardrobe models (parametric, multiple door/drawer configurations)
- Kitchen models (ready for customization)
- Additional furniture pieces stored locally

**Export Capabilities:**
- PNG, JPG, PDF, GLB, OBJ, FBX formats
- Version history (3 saved versions visible in builder)

---

## PHASE ONE: AI-POWERED NATURAL LANGUAGE INPUT

**Objective:** Transform the homepage into an intelligent entry point. Users describe what they want in plain language. AI understands intent and routes them to the correct builder with pre-populated parameters.

### Implementation:

#### 1. Homepage Hero Section Redesign
- Replace "Start Designing" button with a prominent text input field
- Label: "Describe your furniture"
- Placeholder examples: "Luxury walnut wardrobe with mirror doors and LED lighting" or "Modern kitchen with oak cabinets and open shelving"
- Add a subtle "Examples" dropdown showing sample prompts for each furniture type
- Include a "Gallery" link so users can browse inspiration before describing

#### 2. Claude API Integration (Natural Language Processor)

**Endpoint:** Receives user description as text input

**Processing Logic:** The LLM reads the description and extracts structured data

**Extraction Categories:**
- a) **Furniture Type:** Wardrobe, Kitchen, Office, Bed, Cabinet, Shelves, Table, Dressing Table
- b) **Style Preset:** Luxury, Minimal, Scandi, Industrial, Classic, Modern
- c) **Materials & Colors:** Oak, Walnut, White, Black, Beige, Mahogany, Linen, Graphite, Sage, Navy, Concrete, Dark Wood
- d) **Hardware Specifications:**
  - Handle Style: Gold Bar, Silver Knob, Black Strip, Hidden Push, Chrome
  - Door Type: Solid Panel, Glass Panel, Full Mirror, Frosted Glass
- e) **Interior Features:**
  - Drawers (rows): None, 1 Row, 2 Rows, 3 Rows
  - Hanger Rods: Yes/No
  - LED Lighting: Off, Warm, Cool, RGB
- f) **Dimensions (if mentioned):** Width, Height, Depth in cm or meters
- g) **Confidence Score:** How certain the AI is about each extraction (0.0 to 1.0)

**Output Format:** JSON object
```json
{
  "furnitureType": "wardrobe",
  "style": "luxury",
  "primaryColor": "walnut",
  "doorType": "full_mirror",
  "handleStyle": "gold_bar",
  "drawerRows": 3,
  "hangerRods": true,
  "ledLighting": "warm",
  "width": 2.4,
  "height": 2.8,
  "depth": 0.60,
  "confidence": {
    "furnitureType": 0.95,
    "style": 0.88,
    "dimensions": 0.65
  },
  "rawDescription": "[user input]"
}
```

#### 3. Routing & Builder Pre-Population
- After API processes the description, redirect user to `/builder`
- Pass the JSON object as URL params or session state
- The builder automatically loads:
  - Correct furniture type (from `furnitureType`)
  - Applies style preset
  - Sets color/material
  - Configures door, handle, drawer, and lighting options
  - Sets dimensions if provided
- User sees their design instantly, ready to fine-tune

#### 4. Fallback Behavior
- If LLM confidence is below 70% for furniture type, show a disambiguation screen: "Did you mean wardrobe or cabinet?" with visual thumbnails
- If no dimensions are detected, use smart defaults based on furniture type (e.g., standard wardrobe is 2.4m W × 2.8m H × 0.6m D)

---

## PHASE TWO: INTERACTIVE GALLERY WITH AI-GENERATED VARIATIONS

**Objective:** Transform the static gallery into a dynamic, interactive showcase. When users browse, they see real 3D models they can rotate, inspect, and customize. The gallery becomes a source of inspiration that feeds directly into the builder.

### Implementation:

#### 1. Gallery Page Redesign
- Current state: 9 static items with images and dimensions
- New state: Each gallery item is a clickable, rotatable 3D model
- Keep existing categories: All, Wardrobe, Kitchen, Office, Bed, Cabinet, Shelves, Table

#### 2. 3D Model Integration for Each Gallery Item
- Load 3D models (GLB or OBJ format) directly in the gallery using Three.js or Babylon.js
- Each model is interactive: users can rotate with mouse, zoom with scroll, see it from all angles
- Display specifications below: dimensions, materials, style, and a "Customize This" button

#### 3. "Customize This" Workflow
- User clicks "Customize This" on any gallery item
- Their chosen model loads directly into the builder with all parameters pre-set
- Builder is now in "customization mode" — user can adjust dimensions, colors, hardware, etc.
- All changes update the 3D preview in real-time

#### 4. AI-Generated Variations (Future Enhancement, Phase Two Extension)
- Optional: When a user views a gallery item, show "Similar Styles" — AI generates 2-3 variations based on the current model
- Example: User views "Oak Wardrobe" → AI suggests "Walnut Wardrobe" and "White Wardrobe" with same proportions
- This requires additional Claude API calls to generate variation suggestions based on existing models

#### 5. Gallery Filter & Search
- Keep existing category filters (Wardrobe, Kitchen, Office, etc.)
- Add text search: user types "mirror" or "LED" and gallery filters to relevant items
- Add style filter: user selects "Luxury" or "Minimal" to see only those styles

---

## PHASE THREE: FACTORY-READY PRODUCTION EXPORT & ORDER BRIDGE

**Objective:** Close the gap between design and manufacturing. When a user finalizes their design, the system generates production specifications and creates a pathway to order from your factory.

### Implementation:

#### 1. "Send to Production" Button
- Add a new button in the builder export section: "Send to Production" (alongside PNG, JPG, PDF, GLB, etc.)
- This button only appears when the design is complete (all required fields filled)
- Clicking it opens a production summary modal

#### 2. Production Specification Document
The system generates a comprehensive production spec including:

**a) Component Breakdown (mm precision):**
- List every piece: top panel, side panels, shelves, door panels, drawer fronts, etc.
- Dimensions in millimeters (width × height × thickness)
- Quantity for each component
- Example output:
  - "Side Panel (Left): 2400mm H × 600mm D × 18mm thickness, quantity 1"
  - "Door Panel (Full Mirror): 600mm W × 2300mm H × 5mm thickness, quantity 2"

**b) Material Specifications:**
- Wood type: Oak, Walnut, etc. (or alternative materials if applicable)
- Edge banding: Type and color matching material
- Hardware list with part numbers (Blum hinges, confirmat screws, handles, etc.)
- Finishing specifications (lacquer, veneer, polish, etc.)

**c) Assembly Instructions:**
- Step-by-step text and visual guides
- Hinge placement and drilling templates
- Drawer assembly sequence
- Final assembly and quality checks

**d) CNC Export Ready:**
- DXF files with BAZIS layer naming conventions (if you use BAZIS)
- G-code .nc files for CNC cutting
- Cutting optimization map (nesting diagram showing how pieces fit on raw material)
- Specification XML file for factory system integration

#### 3. Export Format Options
- **PDF:** Production card (printed documentation for factory floor)
- **JSON:** Machine-readable specification for factory ERP or CNC software
- **XML:** Compatible with BAZIS-Mebelshik API for direct integration
- **ZIP:** Complete package including DXF, G-code, cutting map, PDF, and XML

#### 4. Order to Factory Workflow
After user reviews the production spec, offer two options:
- a) **"Download for My Workshop"** — user gets the complete spec package to send to any manufacturer
- b) **"Order from FurniAI Factory"** — user submits order to your UAE-based factory

If "Order from FurniAI Factory" is selected:
- Show order summary: dimensions, materials, estimated price, delivery timeline
- Capture user details: name, email, phone, delivery address
- Generate a unique Order ID (e.g., FURNI-2026-001234)
- Send production spec automatically to factory backend / email / WhatsApp (your choice)
- Create an order record in your system (database or spreadsheet)

#### 5. Pricing Engine (Simple Version for Phase Three)
- Calculate base material cost: (total panel area in m²) × (cost per m² for selected wood type)
- Add hardware cost: sum of all hardware items
- Add labor/production cost: fixed markup based on furniture complexity
- Add delivery cost: based on UAE postal code or fixed rate
- **Total Price = Material + Hardware + Labor + Delivery**
- Example: "2.4m walnut wardrobe: 450 AED material + 80 AED hardware + 200 AED production + 50 AED delivery = 780 AED"

#### 6. Order Confirmation & Tracking
- Send user a confirmation email with Order ID, production spec attachment, and estimated delivery date
- Create a "Track My Order" link (Phase Four feature, placeholder for now)

---

## PHASE FOUR: USER ACCOUNTS & ORDER MANAGEMENT

**Objective:** Enable users to save designs, track orders, and manage their account. Build community and loyalty.

### Implementation:

#### 1. User Registration & Authentication
- Simple sign-up: email + password (or Google/Gmail OAuth option)
- Profile creation: name, phone, default delivery address
- All data stored in a database (Supabase, Firebase, or PostgreSQL recommended)

#### 2. User Dashboard
- **"My Designs"** section: list all saved designs with thumbnails, dates, and quick actions (Edit, Delete, Share, Order)
- **"My Orders"** section: list all submitted orders with status (Processing, Fabricating, Quality Check, Shipped, Delivered)
- **"Saved Items"** section: bookmarked gallery items and design variations
- **Account settings:** update profile, change password, manage delivery addresses

#### 3. Design Versioning & Collaboration (Optional)
- Each design can have multiple versions (already visible in builder as "Golden Oak," "Dark Walnut," "Glossy White")
- Users can revert to older versions or branch into new variations
- Optional: share a design with a colleague or client via unique link (read-only or editable)

#### 4. Order Tracking
- Each order has a status page: Processing → Fabricating → Quality Check → Shipped → Delivered
- User can see which CNC machine their order is on, estimated completion date
- Factory can push status updates via admin panel (Phase Four extension)

#### 5. Invoice & Documentation
- Auto-generate invoice when order is placed
- Production spec and assembly instructions downloadable from order page
- Warranty information included

---

## TECHNICAL ARCHITECTURE SUMMARY

### Frontend:
- React.js or Vue.js (your existing Vercel deployment uses Next.js, so continue with that)
- Three.js or Babylon.js for 3D model rendering
- Responsive design for mobile, tablet, desktop

### Backend:
- Node.js / Express or Next.js API routes
- Claude API integration for natural language processing
- Database: Supabase (PostgreSQL) or Firebase for user accounts, designs, orders
- File storage: AWS S3 or Vercel Blob for 3D models, PDFs, DXF files

### External Integrations:
- Claude API (for NLP and design parameter extraction)
- Email service (SendGrid, Resend, or similar) for order confirmations
- Optional: WhatsApp Business API for order notifications to your factory
- Optional: Payment gateway (Stripe, PayPal) if you accept online payments in Phase Four

---

## IMPLEMENTATION PRIORITY & TIMELINE

- **Phase One (Weeks 1-3):** Natural language input, Claude API integration, builder pre-population
- **Phase Two (Weeks 4-5):** Interactive gallery with 3D models, rotation, filtering
- **Phase Three (Weeks 6-8):** Production specification generation, order workflow, pricing engine
- **Phase Four (Weeks 9-12):** User accounts, dashboard, order tracking, invoicing

---

## SUCCESS METRICS

- **Phase One:** Users can describe furniture and see a customized 3D design within 10 seconds
- **Phase Two:** Gallery items load in under 2 seconds, 3D rotation is smooth (60 FPS)
- **Phase Three:** Production spec is accurate enough for factory to manufacture without questions
- **Phase Four:** Users return to reorder or create new designs; repeat customer rate increases

---

## NOTES FOR IMPLEMENTATION TEAM

- Keep the existing 3D wardrobe and kitchen models as the core catalog. Don't rebuild them.
- Claude API is your NLP engine. Tuning the extraction prompt will be critical for accuracy.
- BAZIS-Mebelshik integration (XML, DXF, G-code export) should be built into Phase Three, since you have production experience with it.
- Test the production spec with your factory team early. Get their feedback on format and completeness.
- Start with email or WhatsApp notifications to factory. Add a proper factory dashboard later if needed.

---

**Document created:** 2026-06-08  
**Status:** Ready for implementation
