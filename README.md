# RevenueFlow - Intelligent Financial & Billing Platform

<div align="center">
  <h3>Next-Generation Financial Management, Invoicing, Dynamic UPI QR Billing & Inventory Surveillance</h3>
</div>

---

## 🌟 Features

- 🧾 **Dynamic QR Code Billing**: Instant UPI QR code generator compatible with GPay, PhonePe, Paytm, BHIM, Cred, and UPI mobile banking apps.
- 📱 **Mobile & PWA Ready**: Installable Progressive Web App (PWA) with full viewport safe-area support and mobile native navigation.
- 📄 **Universal PDF & Calendar Export**: Cross-device PDF invoice generator and ICS reminder export with WhatsApp and Native Web Share fallback.
- 🌓 **Dark & Light Mode**: Complete adaptive interface with synchronized mobile status bar theme.
- 🔔 **Inventory Surveillance**: Real-time stock alerts, low-stock notifications, and quick stock increment controls.
- 📊 **Financial Analytics**: Comprehensive revenue, expenses, and transaction breakdowns.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000/` and on your local network IP (e.g. `http://192.168.1.4:3000/`).

---

## 📦 Build & Production

```bash
# Build web app
npm run build

# Preview build
npm run preview
```

---

## 📱 Mobile (Capacitor Android)

```bash
# Sync web build to Android project
npx cap sync android

# Open Android Studio
npx cap open android
```
