# FF SHOP — Premium Free Fire E-commerce Platform

Production-ready gaming website selling **Free Fire Guild Glory Bot** packages and **Diamond Top-Up (Weekly / Monthly)** passes with dynamic bKash payment system and real-time Admin Panel.

## Features
- **FF GUILD GLORY**: 3 Bot packages with Bengali Rules & Conditions
- **WEEKLY / MONTHLY**: 7 Diamond pass options with Player UID verification
- **Dynamic bKash Payment**: Send Money only instruction, copyable payment number with one-tap feedback
- **WhatsApp Integration**: Instant prefilled URL-encoded order message
- **Live Firestore Sync**: Changes to products, packages, notices, and payment numbers update without refresh
- **Admin Panel**: Dashboard statistics, order verification, product thumbnail uploads, payment configuration, notice management, ad banners
- **Source Code Export**: One-click download of the complete source bundle

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore and Google Authentication
   - Deploy security rules: `firebase deploy --only firestore:rules`

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
