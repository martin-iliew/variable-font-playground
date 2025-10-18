# Variable Font Playground

An interactive web application for exploring and experimenting with variable fonts. Upload any variable font (TTF/OTF) and dynamically adjust its axes in real-time to see how typography transforms. Generate CSS code for your custom configurations instantly.


## Features

- **🎨 Live Font Preview** – See your font changes in real-time with an editable text area
- **📁 Drag & Drop Upload** – Easily upload `.ttf` or `.otf` variable font files
- **🎛️ Dynamic Axis Controls** – Adjust all available variable axes (weight, width, slant, etc.) with sliders and numeric inputs
- **📋 CSS Export** – Copy CSS `font-variation-settings` for use in your projects
- **📊 Font Metadata** – View font name, version, designer, file size, and available axes
- **🌓 Dark Mode** – Toggle between light and dark themes
- **📝 Text Presets** – Quick access to common text samples (Title, Pangram, Paragraph, Wikipedia)
- **🔄 Reset Functionality** – Restore all axes to their default values

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Font Parsing**: [fontkit](https://github.com/foliojs/fontkit) & [opentype.js](https://opentype.js.org/)
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 10.23.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/martin-iliew/variable-font-playground.git
cd variable-font-playground
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload a Variable Font**
   - Drag and drop a `.ttf` or `.otf` file onto the dropzone, or click to browse
   - Only variable fonts with adjustable axes are supported

2. **Adjust Font Axes**
   - Use the sliders or numeric inputs to modify axes like weight (`wght`), width (`wdth`), slant (`slnt`), etc.
   - Changes are reflected instantly in the preview area

3. **Customize Preview Text**
   - Type directly in the preview area or use preset text samples
   - Adjust font size with the slider (12px - 144px)

4. **Export CSS**
   - Click "Copy CSS" to copy the `font-variation-settings` declaration to your clipboard
   - Paste it into your stylesheets to use the exact configuration

## Project Structure

```
src/
├── app/
│   ├── api/axes/          # API endpoint for font parsing
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main playground page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── FontDropzone.tsx   # File upload component
│   ├── FontUploadDialog.tsx
│   └── FontDetailsDropdown.tsx
├── hooks/
│   └── useFontPlaygroundController.ts  # Main state management
└── lib/
    └── fonts.ts           # Font parsing utilities
```

## Scripts

- `pnpm dev` – Start development server (Turbopack)
- `pnpm build` – Build for production
- `pnpm start` – Start production server
- `pnpm lint` – Run ESLint
