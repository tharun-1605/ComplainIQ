# ComplainIQ | Civic Complaint & Public Governance System

> A modern, full-stack civic governance web application featuring interactive Mapbox routing, live incident tracking, resolution workflows, and high-end glassmorphism UI.

## 🚀 Live Deployment
- **Vercel Web App**: [https://public-complient-websitw.vercel.app/](https://public-complient-websitw.vercel.app/)

## ✨ Key Features
- **Public Complaint Feed**: Real-time civic feed with category filters, upvotes, inline comments, and fullsize image lightboxes.
- **Executive Admin Console**: KPI metric cards, status update controls, official municipal response composer, Mapbox geolocation inspector, and CSV report export.
- **Interactive Mapping**: Incident geolocation tracking powered by Mapbox GL JS & OpenStreetMap reverse geocoding.
- **Modern Glassmorphism UI**: Built with Framer Motion, Tailwind CSS, Google Fonts, and custom glass tokens.

## 💻 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide & Heroicons
- **Mapping**: Mapbox GL JS
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB, Mongoose

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Express Backend (Port 5000)
node server/server.js

# 3. Start Vite Frontend (Port 5173)
npm run dev
```

## 🧪 Selenium Smoke Tests

```bash
# Run headless test
npm run selenium:test

# Run visible browser test
npm run selenium:test:headed
```
