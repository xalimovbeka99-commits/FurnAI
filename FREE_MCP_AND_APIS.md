# 🛋️ Free MCP Servers & APIs for Furni AI

This document serves as a centralized reference for developers working on **Furni AI**. It lists free Model Context Protocol (MCP) servers and APIs (with generous free tiers) that can be integrated to extend Furni AI's features, along with direct signup links and setup instructions.

---

## 📡 Free Model Context Protocol (MCP) Servers
Model Context Protocol (MCP) is an open-source standard that enables AI models to connect securely to data sources and tools. The following servers are **free and open-source** and can be run locally or integrated with your IDE (e.g., Cursor, Claude Desktop).

### 1. Database & Storage MCPs
*   **Supabase MCP Server**
    *   **Description:** Allows the AI to inspect, query, and manage your Supabase database schema, tables, and relationships.
    *   **Integration URL:** `https://mcp.supabase.com/mcp`
    *   **Configuration:**
        ```json
        "supabase": {
          "type": "http",
          "url": "https://mcp.supabase.com/mcp"
        }
        ```
*   **Postgres MCP Server**
    *   **Description:** Direct connection to any PostgreSQL database (like your Supabase instance) to query and analyze data.
    *   **GitHub/Link:** [Postgres MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-postgres "postgresql://user:password@host:port/database"
        ```

### 2. Standard Utility MCPs
*   **Filesystem MCP Server**
    *   **Description:** Grants the AI secure, scoped read/write access to local project directories to edit files, inspect logs, and manage 3D assets.
    *   **GitHub/Link:** [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-filesystem "C:\\Users\\xalim\\OneDrive\\Desktop\\FurnAI"
        ```
*   **Fetch MCP Server**
    *   **Description:** Converts web page content into clean markdown for the AI to read, enabling it to research API documentation.
    *   **GitHub/Link:** [Fetch MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-fetch
        ```
*   **Memory MCP Server**
    *   **Description:** A graph-based local memory system that lets the AI save persistent knowledge about user preferences.
    *   **GitHub/Link:** [Memory MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-memory
        ```

### 3. Developer & Web Search MCPs
*   **Brave Search MCP Server**
    *   **Description:** Gives the AI web search capabilities to find documentation, code snippets, or 3D furniture libraries.
    *   **GitHub/Link:** [Brave Search MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-brave-search
        ```
*   **GitHub MCP Server**
    *   **Description:** Allows the AI to query issues, create pull requests, and manage repositories.
    *   **GitHub/Link:** [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
    *   **Configuration Command:**
        ```bash
        npx -y @modelcontextprotocol/server-github
        ```

---

## 🔌 Free APIs (with Generous Free Tiers)
Here are free web APIs that you can integrate directly into the Furni AI codebase for 3D model search, texture generation, email, and authentication.

### 1. 3D Model & Assets APIs
*   **Open Source 3D Assets (GitHub JSON)**
    *   **Description:** A free public repository of high-quality GLB/OBJ models. You can query the database directly without API keys.
    *   **Link:** [Open Source 3D Assets Repo](https://github.com/open-source-3d-assets)
    *   **Usage:** Fetch GLB models directly from raw GitHub CDN.
*   **Sketchfab Data API**
    *   **Description:** Connect to millions of 3D models. Standard API accounts are free and allow searching for Creative Commons licensed furniture models.
    *   **Signup Link:** [Sketchfab Developer Portal](https://sketchfab.com/developers/data-api)
    *   **Key Benefit:** Great for loading secondary decor models (e.g. plants, lamps, chairs) to compliment parametric designs.
*   **Meshy.ai API**
    *   **Description:** Generate 3D assets from text prompts or 2D images. Offers free monthly credits.
    *   **Signup Link:** [Meshy API Keys](https://app.meshy.ai/settings/api-keys)
    *   **Key Benefit:** Generating custom upholstery, hardware, or decorative items dynamically.

### 2. Generative AI & Texture APIs
*   **Pollinations.ai API**
    *   **Description:** Completely free text-to-image and text-to-text generation.
    *   **Signup/Key Link:** [Pollinations API Portal](https://enter.pollinations.ai)
    *   **Endpoint:** `https://gen.pollinations.ai/v1/images/generations` (OpenAI compatible)
    *   **Key Benefit:** Creating high-resolution previews, backdrops, or texture materials for furniture finishes.
*   **Cloudflare Workers AI**
    *   **Description:** Offers free daily generations (up to 100k requests/day) for LLMs and Stable Diffusion image models.
    *   **Signup Link:** [Cloudflare Dashboard](https://dash.cloudflare.com)
    *   **Key Benefit:** Cost-effective serverless AI inference.
*   **Hugging Face Inference API**
    *   **Description:** Run open-source image, text, and 3D generation models with a free rate-limited tier.
    *   **Signup Link:** [Hugging Face Developer API](https://huggingface.co/docs/api-inference/index)

### 3. Backend, DB & Storage
*   **Supabase (Database, Auth & Storage)**
    *   **Description:** A complete Firebase alternative offering a free tier with a Postgres database, user sign-ups, and file storage for saved 3D/GLB designs.
    *   **Signup Link:** [Supabase Project Dashboard](https://supabase.com/dashboard)
*   **Cloudinary**
    *   **Description:** Cloud image and media storage. Offers a generous free tier for storing, compressing, and serving wood/cabinet textures.
    *   **Signup Link:** [Cloudinary Console](https://console.cloudinary.com)
*   **Resend**
    *   **Description:** Modern email sending service. The free plan provides up to 3,000 emails per month.
    *   **Signup Link:** [Resend API Keys](https://resend.com/api-keys)
    *   **Key Benefit:** Auto-emailing manufacturing specs/receipts to clients.

---

## 🛠️ Copy & Paste Configuration Files

### 1. IDE Configuration (`.cursor/mcp.json`)
If you use Cursor or VSCode with Claude, copy and paste this into `.cursor/mcp.json` (replacing placeholder keys):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\xalim\\OneDrive\\Desktop\\FurnAI"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### 2. Environment Variables (`.env.local`)
Copy this template, fill in your free keys, and save it as `.env.local` in the project root:

```env
# ── AI API Keys ──────────────────────────────────────────
# Get free/trial keys at respective developer portals
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ── Pollinations AI (Free Text-to-Image / Text-to-Text) ──
# Register at: https://enter.pollinations.ai
POLLINATIONS_API_KEY=your_pollinations_api_key_here

# ── 3D Model Generation (Meshy.ai) ──────────────────────
# Register at: https://app.meshy.ai
MESHY_API_KEY=your_meshy_api_key_here

# ── Supabase Backend (Database, Auth, Storage) ──────────
# Create free project at: https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ── Resend Email (3,000 free emails/month) ──────────────
# Create free key at: https://resend.com
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=orders@furnai.com

# ── Cloudinary Texture Storage (Free Tier) ──────────────
# Create free cloud at: https://cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# ── Brave Search API (Free/Trial Key) ───────────────────
# Get key at: https://brave.com/search/api/
BRAVE_API_KEY=your_brave_api_key_here

# ── GitHub Token (For MCP) ──────────────────────────────
# Create token at: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here
```

---

## 💻 Sample Code: Integrating Pollinations AI for Furniture Rendering
Here is how you can write a utility function in Next.js to generate furniture thumbnail images using Pollinations AI (completely free):

```javascript
// src/app/api/ai-image/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    // Using Pollinations AI's OpenAI-compatible endpoint or GET endpoint
    const response = await fetch('https://gen.pollinations.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}` // optional if you use your key
      },
      body: JSON.stringify({
        prompt: `Photorealistic clean studio view of furniture: ${prompt}, white background, 3d model render style`,
        model: 'flux',
        width: 1024,
        height: 1024
      })
    });

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
```
