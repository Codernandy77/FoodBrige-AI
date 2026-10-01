# FoodBridge AI 🤝

**Smart Surplus Food Redistribution & Hunger Relief Platform**

FoodBridge AI is a complete, production-grade social-impact technology platform designed to reduce food wastage from hotels, marriage halls, corporate office cafeterias, and resorts by rapidly routing edible surplus food to local NGOs, shelter homes, and volunteers.

This platform is configured for **Tamil Nadu, India** (specifically Chennai area coordinates) but utilizes a modular architecture ready to scale globally.

---

## 🚀 Key Architectural Innovations

1. **Dual-Mode Persistent Storage (100% Zero-Config)**
   - The backend checks for a running MongoDB database instance on startup.
   - If MongoDB is not active or not installed, the application **automatically falls back to a custom JSON database engine** (`data/*.json`).
   - The platform works fully out of the box with zero database prerequisites!

2. **Automated Preliminary Safety Assessment (Rule Engine)**
   - Prior to submission, donors fill out cooking times, perishability categorizations, storage conditions, coverage exposure, and reheating histories.
   - A conservative scientific rule engine calculates safety statuses (`SAFE`, `CAUTION`, `URGENT REVIEW`, `DO NOT DISTRIBUTE`) and priority urgency scores (`0-100`) to prioritize pickups.

3. **Smart Matching Proximity Engine**
   - Renders matching donations to nearby verified NGOs, sorted by physical distance, ensuring urgent food reaches the closest community hub first.

4. **Leaflet OpenStreetMap with High-Fidelity SVG Fallback**
   - Uses Leaflet OSM maps for location pinning.
   - If offline or tile servers fail, it displays a stylized interactive SVG district map of Chennai to ensure the UI remains visual and functional.

5. **Certified Food Rescue Recognition**
   - Once NGOs confirm food distribution, donors earn reward points, badges, and a custom printable **Certificate of Food Rescue** with unique digital verification hashes.

6. **English & Tamil Translation toggle**
   - The entire user interface can be toggled between English and Tamil instantly.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS v3, React Router, Lucide Icons, Recharts (for analytics).
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: MongoDB/Mongoose OR auto-fallback Local JSON database.
- **Auth**: JWT tokens, bcrypt password hashing, Role-Based Route Guards.

---

## 📂 Project Directory Structure

```
foodbridge-ai/
├── client/
│   ├── src/
│   │   ├── components/      # InteractiveMap (OSM + SVG Fallback), Layout
│   │   ├── context/         # Auth, Language, Notification contexts
│   │   ├── i18n/            # translations (English & Tamil)
│   │   ├── pages/           # Landing, Login, Register, dashboards (4 roles)
│   │   ├── services/        # api.ts connector
│   │   └── index.css        # Tailwind design tokens
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/          # db.ts (Mongoose check)
│   │   ├── controllers/     # auth, donation, pickup, admin controllers
│   │   ├── middleware/      # auth role token verifications
│   │   ├── models/          # User, Donation, Pickup, Notifications
│   │   ├── routes/          # API express router definitions
│   │   └── services/        # safetyCalculator rules engine
│   └── package.json
├── data/                    # Created dynamically for JSON storage mode
├── package.json             # Monorepo root scripts
└── README.md
```

---

## 💿 Installation & Setup

Follow these simple steps to run the application locally:

### 1. Install All Dependencies
Run from the project root folder. This will automatically install packages for the root, client, and server workspaces using npm workspaces:
```bash
npm install
```

### 2. Seed Mock Demo Data
Seeds the database/JSON files with 4 primary demo accounts, 10 donors, 5 NGOs, 10 volunteers, 20 active/completed donations, notifications, and hunger reports:
```bash
npm run seed
```

### 3. Start the Development Servers
Starts the backend Express server on `http://localhost:5000` and the React Vite client on `http://localhost:5173` concurrently:
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 👤 Demo Login Credentials

Use the following credentials to test different roles. The password for all accounts is **`password123`**:

1. **Food Donor**: `donor@foodbridge.demo`
   - *Use Case*: Post surplus food, see live safety assessments, check badge points, download rescue certificate.
2. **NGO Shelter**: `ngo@foodbridge.demo`
   - *Use Case*: Find nearby donations (proximity matched), accept food, assign volunteer couriers, confirm drop-off.
3. **Volunteer Partner**: `volunteer@foodbridge.demo`
   - *Use Case*: Accept route assignments, view map checkpoint timeline, simulate delivery runs.
4. **Platform Administrator**: `admin@foodbridge.demo`
   - *Use Case*: Review NGO verification documents, suspend/activate users, monitor system activity logs, analyze Recharts metrics.

---

## 📋 Recommended Testing Scenario

1. Log in as a **Donor** (`donor@foodbridge.demo`):
   - Fill out the surplus donation form.
   - Enter a food category and cooking details. Notice how the safety status changes dynamically (e.g. checking the "exposed to air" box reduces the safe window and updates the warnings).
   - Submit the donation.
2. Log out and log in as the **NGO** (`ngo@foodbridge.demo`):
   - Navigate to the dashboard. You will see the new donation listed under "Nearby Available Donations" sorted by proximity distance.
   - Accept the donation.
   - Select "Ramesh Kumar" (Volunteer) from the dropdown list and click "Assign Volunteer".
3. Log out and log in as the **Volunteer** (`volunteer@foodbridge.demo`):
   - See the active route job card with Point A (Donor) and Point B (NGO) details.
   - Click "Start Pickup Route" to trigger the GPS simulation.
   - Click "Confirm Food Collected", then "Confirm Delivery at NGO".
4. Log out and log in as the **NGO** (`ngo@foodbridge.demo`):
   - The accepted job card is now status "DELIVERED".
   - Click "Confirm Distribution Completed".
5. Log out and log in as the **Donor** (`donor@foodbridge.demo`):
   - Check the notifications bell at the top right. You will see a notification saying you earned points and that your donation is completed.
   - Scroll down to the completed donations history and click **"Download Certificate"**. A beautiful modal representing the digital certificate will show, ready for printing.
