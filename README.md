# MolCal Suite - Unified Chemistry Tools

A complete suite of chemistry calculation and simulation tools merged into a single application.

## Overview

MolCal Suite combines three powerful chemistry tools:

### 1. **MolCal Stoichiometry Calculator** (`/molcal`)

- Calculate stoichiometric ratios for chemical reactions
- Compute molar weights and compound properties
- Calculate yields and theoretical calculations
- Save and manage compound database
- Export results to Excel

### 2. **Molecular Weight Calculator** (`/mw-calc`)

- Draw molecules using JSME editor
- Calculate molecular weights from structures
- Convert between SMILES notation and structures
- Real-time MW calculations using RDKit.js
- Calculate exact mass and other descriptors

### 3. **TLC Simulator** (`/tlc-sim`)

- Simulate thin-layer chromatography experiments
- Add and manipulate spots on virtual TLC plates
- Multiple shape and color options
- UV light mode selection (Short/Long)
- Download simulated TLC plates as images

## Project Structure

```
MolCal-Merged/
├── package.json           # Dependencies for Express and RDKit
├── server.js              # Main server with routing
└── public/
    ├── index.html         # Home page with navigation
    ├── molcal/
    │   └── index.html     # Stoichiometry tool
    ├── mw-calc/
    │   ├── index.html     # MW Calculator interface
    │   └── app.js         # RDKit integration
    └── tlc-sim/
        └── index.html     # TLC Simulator
```

## Installation & Setup

### Prerequisites

- Node.js (v12 or higher)

### Installation Steps

1. Navigate to the project folder:

   ```bash
   cd MolCal-Merged
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Usage

### Home Page

- Browse all three chemistry tools
- Click on any tool card to access it

### Navigation

- Use the header navigation to switch between tools
- MolCal Suite logo links back to home

### Tool-Specific Features

**Stoichiometry Calculator:**

- Enter limiting reactant weight and MW
- Add multiple compounds
- Auto-calculate moles, weight, and volume
- Calculate % yield
- Save and load compounds from database

**Molecular Weight Calculator:**

- Draw structures in the JSME editor
- Calculate MW from drawn structures
- Or paste SMILES strings directly
- Get exact mass and descriptors

**TLC Simulator:**

- Add up to 5 spots per lane
- Customize spot shape and color
- Add labels to spots
- Drag spots to adjust positions
- Add second TLC plate for comparison
- Download plates as PNG images

## Dependencies

- **Express.js** - Web server framework
- **RDKit.js** - Cheminformatics library for MW calculations
- **JSME Editor** - Molecular structure drawing tool
- **SheetJS (XLSX)** - Excel export functionality

## External Libraries (CDN)

- RDKit: `https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js`
- JSME: `https://cdn.jsdelivr.net/npm/jsme-editor/jsme.nocache.js`
- SheetJS: `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`

## Features

✅ Unified single-port application (localhost:3000)
✅ Responsive design for desktop and mobile
✅ Modern gradient UI with smooth navigation
✅ No external database required (localStorage for compounds)
✅ Real-time calculations and updates
✅ Export functionality (Excel)
✅ Download simulation results (PNG)

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

Educational use - Developed for chemistry students and educators

## Credits

Developed by:

- Parth D. Parmar (MolCal Stoichiometry)
- Chemistry Department, Gujarat University

## Support

For suggestions or issues:

- Email: parmarparth2111@gmail.com
- Email: vaibhav.ag464@gmail.com

---

**Happy calculating! 🧪**
