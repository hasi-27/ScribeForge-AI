# ScribeForge AI - Enterprise Multi-Industry Social Content Platform

> Production-ready AI Content Writing Platform engineered to convert planning inputs and multi-format reference files into structured, grounded, industry-specific social media campaigns.

---

## 🌟 Core Highlights

1. **4 Mandatory Industry AI Engines**:
   - **Real Estate**: *Location, Amenities, Lifestyle, Investment, Property USP, Configuration, Architecture*
   - **Jewellery**: *Craftsmanship, Luxury, Occasion, Design, Materials, Emotion, Gifting*
   - **Product - Perfume**: *Fragrance notes, Mood, Personality, Lifestyle, Luxury, Occasion, Sensory language*
   - **FMCG - Food**: *Taste, Ingredients, Convenience, Family, Consumption occasions, Product benefits, Food appeal*

2. **Deterministic Duration-to-Post Cardinality**:
   - `1 Week` $\rightarrow$ Exactly **3 Posts**
   - `2 Weeks` $\rightarrow$ Exactly **6 Posts**
   - `1 Month` $\rightarrow$ Exactly **12 Posts**

3. **Multi-Format Reference File Intelligence**:
   - Accepts **PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, and Images (JPG/PNG)**.
   - Normalizes text, structural chunks, page/sheet metadata, summaries, and performs grounded fact citation (`reference_basis`).

4. **Automated Quality & Validation Engine (V-01 to V-08)**:
   - **V-01**: Schema Validity (100% adherence to JSON Schema)
   - **V-02**: Post Count (Exact 3, 6, 12 cardinality)
   - **V-03**: Required Content Blocks (Date, Caption, Visual Direction, Hashtags)
   - **V-04**: Industry Specificity (Calculated score $\ge 0.75$)
   - **V-05**: Reference Grounding (Attribution to uploaded source facts)
   - **V-06**: Diversity (Zero duplicate hooks or near-duplicate openings)
   - **V-07**: Hashtag Relevance (Hashtag taxonomy without spam tags)
   - **V-08**: Visual Usability (Actionable composition, lighting, camera, text overlays)

5. **Multi-View Interactive Workspace**:
   - **Card Grid View**: Rich social media cards with copy-to-clipboard actions.
   - **Calendar View**: Interactive timeline showing post cadence across the schedule.
   - **Detail Feed View**: Deep dive inspection with reference snippets and validation tags.
   - **In-Place Post Editing (`PATCH`)** and **Single-Post Regeneration**.
   - **Multi-Format Export**: CSV (Excel/Sheets), JSON, Markdown, and formatted clipboard copy.

6. **Section 9.1 Evaluation Benchmark Matrix**:
   - Built-in regression runner executing 12 cross-industry scenarios with automated reporting.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20+)
- npm

### Installation
```bash
# Install root dependencies
npm install

# Install server & client packages
npm run install:all
```

### Running Locally
```bash
# Launch both backend (Port 5001) and frontend (Port 5173)
npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🧪 Running Automated Test Suite

```bash
cd server
npx tsx test-api.ts
```

Output:
```
🏁 Test Results: 55 / 55 Passed (100%)
```

---

## 📡 REST API Reference

| Endpoint | Method | Purpose | Input / Payload |
| :--- | :--- | :--- | :--- |
| `/api/generations` | `POST` | Start content generation | `{ industry, duration, post_count, content_type, reference_file_ids, start_date }` |
| `/api/generations/:id` | `GET` | Get generation status & result | Generation ID in URL |
| `/api/files` | `POST` | Upload reference document | `multipart/form-data` with `file` |
| `/api/files` | `GET` | List all uploaded reference files | None |
| `/api/files/:id` | `GET` | Get file metadata & structural chunks | File ID in URL |
| `/api/files/:id` | `DELETE` | Remove reference file | File ID in URL |
| `/api/generations/:id/regenerate` | `POST` | Regenerate single post or plan | `{ scope: 'single' \| 'full', post_number, instruction }` |
| `/api/generations/:id/posts/:postNumber` | `PATCH` | Edit generated post | `{ caption, visual_direction, hashtags, date }` |
| `/api/posts/:id` | `PATCH` | Edit post by identifier | `{ caption, visual_direction, hashtags }` |
| `/api/evaluations/regression` | `GET` | Run 12-matrix regression suite | None |
| `/api/industry-profiles` | `GET` | Get all 4 industry specifications | None |
| `/api/settings` | `GET / POST` | Configure AI provider / API key | `{ provider, apiKey }` |

---

## 📂 Project Architecture

```
AI_weekly_Assignement/
├── client/                     # Vite + React 18 + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Glassmorphic UI Components
│   │   │   ├── Header.tsx      # Navigation, Demo presets, Settings
│   │   │   ├── IndustrySelector.tsx # 4 Mandatory Industry Cards
│   │   │   ├── PlanSelector.tsx     # 1W/3P, 2W/6P, 1M/12P
│   │   │   ├── ContentTypeSelector.tsx # Carousel, Reel, Static, Story
│   │   │   ├── FileUploadZone.tsx   # Multi-format uploader & vault
│   │   │   ├── ContentPlanWorkspace.tsx # Multi-view workspace
│   │   │   ├── CalendarView.tsx     # Scheduled timeline grid
│   │   │   ├── PostCard.tsx         # Post card with copy, edit, regen
│   │   │   ├── EditPostModal.tsx    # In-place post editor
│   │   │   ├── RegeneratePostModal.tsx # Single post regeneration
│   │   │   ├── ValidationReportModal.tsx # V-01 to V-08 Inspector
│   │   │   ├── ExportModal.tsx      # CSV, JSON, Markdown, Copy
│   │   │   ├── RegressionModal.tsx  # Section 9.1 Benchmark Runner
│   │   │   └── SettingsModal.tsx    # Model provider selector
│   │   ├── styles/
│   │   │   └── index.css       # Bespoke Glassmorphic CSS Design System
│   │   ├── types.ts            # Frontend TypeScript types
│   │   └── App.tsx             # Root Application State & Flow
│   └── vite.config.ts          # Port 5173 & API proxy to 5001
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── industryProfiles.ts # 4 Mandatory Industry Domain Profiles
│   │   ├── routes/
│   │   │   └── api.ts          # REST API Endpoints
│   │   ├── services/
│   │   │   ├── aiOrchestrator.ts # 4-Layer Prompt Engine + Multi-Provider
│   │   │   ├── fileIngestion.ts  # Universal File Parser & Chunking
│   │   │   ├── validator.ts      # V-01 to V-08 Quality Suite
│   │   │   └── database.ts       # Persistence & Audit Event Store
│   │   └── index.ts            # Express Server on Port 5001
│   └── test-api.ts             # Automated 55-Test Verification Suite
│
├── run-dev.js                  # Cross-platform concurrent runner
├── package.json                # Root orchestration scripts
└── README.md                   # Complete Platform Documentation
```

---

## 🔒 Security & Quality Compliance
- Strict file extension allowlists (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.png`, `.jpg`).
- Defenses against prompt injection in untrusted reference material.
- Generation IDs, versioned post edits, and complete audit trail persistence.
