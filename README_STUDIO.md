# Campaign Concept Studio — Documentation & Guide

The Campaign Concept Studio is a full-stack dashboard built for marketing teams. It allows users to design multi-channel campaign concepts, draft variants, construct checklists, and generate visuals.

---

## 🏗️ Architectural Design: Client/Server Boundary

To protect developer API keys and optimize execution, the system implements a strict **Client/Server boundary**:

```
+--------------------------------------------------------+
|                      CLIENT SIDE                       |
|  - Renders the interactive forms (brief, audience...)  |
|  - Handles tab selection (Copy, Checklist, Visuals)    |
|  - Manages loader status, checklists & modal states     |
+--------------------------------------------------------+
                           |
                     POST /api/campaign
                           |
+--------------------------------------------------------+
|                      SERVER SIDE                       |
|  - Instantiates the OpenAI SDK client                  |
|  - Securely accesses process.env.OPENAI_API_KEY        |
|  - Invokes client.responses.create (Responses API)     |
|  - Standardizes text output extraction                 |
|  - Triggers client.images.generate (Image API)         |
|  - Returns consolidated JSON back to the client        |
+--------------------------------------------------------+
```

---

## ⚙️ How to Adjust Model, Prompt, and Image Settings

All AI configuration is housed on the server side in [src/app/api/campaign/route.js](file:///c:/Users/xalim/OneDrive/Desktop/FurnAI/src/app/api/campaign/route.js). Here is where to make modifications:

### 1. Adjusting the Text Model
In `POST()`, find the `responses.create` block:
```javascript
const response = await openai.responses.create({
  model: "gpt-4o", // Change to "gpt-5.5" or "gpt-4o-mini"
  input: userPrompt,
  instructions: SYSTEM_INSTRUCTIONS
});
```

### 2. Tuning the Structured Output Prompt
The JSON template, copy guidelines, and instructions are defined in the `SYSTEM_INSTRUCTIONS` constant:
* Edit `SYSTEM_INSTRUCTIONS` to adjust structural fields, variant constraints, or instructions.

### 3. Tuning the Image Generation Settings
In `POST()`, find the image loop. It tries the latest flagship model and gracefully falls back to legacy formats on older key profiles:
* To adjust the image resolution, change `"1024x1024"` to `"512x512"` or `"256x256"`.
* To adjust the model parameter directly, modify `gpt-image-2`, `dall-e-3`, or `dall-e-2` strings.

---

## 🔑 Environment Variable Setup

1. Create a `.env.local` file in your project root:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your OpenAI key:
   ```env
   OPENAI_API_KEY=sk-proj-yourActualKeyHere
   ```
   *Note: If no key is set or the key is placeholder, the app gracefully switches to a high-fidelity **Mock Fallback** mode so you can still review all visual tabs and states.*

---

## 🚀 Installation & Running

```bash
# 1. Install dependencies (adds openai SDK)
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:3000/studio](http://localhost:3000/studio) in your browser.

---

## 🧪 Validation Plan

### Phase 1: Local Mock Check
1. Start the server without setting `OPENAI_API_KEY` (or with the default placeholder).
2. Navigate to `/studio`.
3. Select the first pre-configured scenario.
4. Click **Synthesize Campaign**.
5. Verify that:
   * The loader displays high-tech step progress.
   * The output successfully renders the mocked title, variants, checklist, and placeholder visual prompts.
   * A warning banner correctly indicates `mock-fallback` mode is active.

### Phase 2: Live Integration Check
1. Add a valid `OPENAI_API_KEY` to `.env.local`.
2. Restart the dev server (`npm run dev`).
3. Fill out the campaign form.
4. Click **Synthesize Campaign**.
5. Verify that:
   * The app sends a request to `/api/campaign`.
   * The server successfully calls OpenAI Responses API and receives a JSON string.
   * Images are rendered using `gpt-image-2` or fallback pipelines.
   * The top status banner shows `OpenAI Responses API — Generation Completed`.
