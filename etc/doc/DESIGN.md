# LeafForm UI/UX Design System Specification

This document defines the core UI/UX guidelines, color scheme, typography, and component styling rules for LeafForm.

---

## 1. Color Palette

### Primary Deep Green (Dark Stage & Left Panels)

- **Gradient Background**: `from-[#092218] via-[#0e2c20] to-[#081a13]`
- **Base Deep Green**: `#112d22`
- **Ambient Stage Glow**: `emerald-500/10` (`rgba(16, 185, 129, 0.1)`)
- **Emerald Highlights & Text**: `#34d399` / `text-emerald-400`
- **Subtle Dark Borders**: `emerald-800/50`

### Brand Accent Greens

- **Shampoo / Form Primary**: `#134e3b`
- **Survey / Quiz Primary**: `#0d5c41`
- **Analytics / Insights Primary**: `#065f46`

### Pure White & Light Contrast (Auth & Card Surfaces)

- **Background White**: `#ffffff`
- **Surface Neutrals**: `#f8fafc` (Slate 50)
- **Borders & Dividers**: `#e2e8f0` (Slate 200)
- **Text Hierarchy**:
  - **Headings & Title**: `#0f172a` (Slate 900)
  - **Body & Subtitles**: `#475569` (Slate 600) / `#64748b` (Slate 500)
  - **Muted Captions**: `#94a3b8` (Slate 400)

### Pastel Graphic Gradients (Showcase Canvas)

- **Purple Pastel**: `from-[#ebdcfc] via-[#e5d2fa] to-[#dfc4f8]`
- **Emerald Pastel**: `from-[#d1fae5] via-[#a7f3d0] to-[#6ee7b7]`
- **Amber Pastel**: `from-[#fef3c7] via-[#fde68a] to-[#fcd34d]`

---

## 2. Carousel & Controls Design

### Navigation Controls

- **Previous Arrow (`<`)**: Muted semi-transparent chevron (`text-white/40 hover:text-white transition-colors`)
- **Play/Pause Toggle (`▶`)**: Solid white filled icon (`text-white fill-white`)
- **Indicator Dots (`●`)**: Equal circular dots (`w-2 h-2 rounded-full`)
  - **Active Dot**: Solid white (`bg-white`)
  - **Inactive Dots**: Muted semi-transparent gray (`bg-white/35 hover:bg-white/60`)
- **Next Arrow (`>`)**: Bright white chevron (`text-white hover:text-white/80 transition-colors`)

---

## 3. Typography & Micro-Interactions

- **Font Family**: Sans-serif (`font-sans`) for main content, Serif (`font-serif`) accents for brand badges.
- **Corner Radii** (Minimal & Slick Studio Aesthetic):
  - Containers / Cards: `rounded-xl` (12px)
  - Inner Graphic Canvas / Preview Boxes: `rounded-lg` (8px)
  - Form Inputs / Buttons / Badges / Actions: `rounded-md` (6px)
  - Global CSS token `--radius` is set to `0.3rem` to enforce consistency.
- **Interactions & Animations**:
  - Smooth 300ms–500ms transitions (`transition-all duration-300` / `duration-500`).
  - Active hover states on interactive buttons and peek cards.
