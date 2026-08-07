# 🚄 Ixigo Live PNR Status Tracker & Railway Platform

A production-grade, cloud-native Railway PNR Tracking and Operations Management Platform inspired by Ixigo, built with **Next.js 15+ (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Auth.js v5**, **Prisma ORM**, and **Docker**.

---

## 🌟 Key Features & Capabilities

### 👨‍✈️ 1. Multi-Role Portal System
* **Passengers**: Search live PNR, auto live polling (30s interval), book tickets, view paginated booking history, download print-ready PDF statements, export Excel CSVs, manage saved favorites, 2FA TOTP security, and multi-language support (10 languages).
* **Train Ticket Examiner (TTR)**: Access station passenger manifest, check-in passengers, manage coach seat charts, and re-allocate vacant seats from no-show passengers to waitlisted tickets.
* **Pantry Manager**: Track passenger meal preferences (Veg / Non-Veg / Jain) and update meal delivery status.
* **Maintenance Engineer**: Track train operations, log equipment/coach incidents with severity levels, and manage luggage parcel barcodes.
* **System Administrator**: Monitor platform analytics, manage staff accounts with sub-role assignments, toggle active status, cascade account deletions, monitor live passenger bookings, and review full system audit logs.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 15+ (App Router, Server Actions, Edge Middleware)
* **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons, Glassmorphism Aesthetics
* **Authentication**: Auth.js (NextAuth v5), Credentials, Google OAuth, 2FA TOTP Verification
* **Database**: Prisma ORM (SQLite for Dev, PostgreSQL ready for Docker / Cloud Run)
* **Testing & Quality**: Vitest, ESLint, Strict TypeScript (`tsc --noEmit`)
* **Containerization & CI/CD**: Docker (Multi-stage build), Docker Compose, GitHub Actions

---

## 🔑 Demo Account Credentials (Password: `password123`)

| Role | Email | Sub-Role / Access |
| :--- | :--- | :--- |
| **Passenger** | `demo@railwaypnr.com` | Full Passenger Features |
| **Admin** | `admin@railwaypnr.com` | System Admin (Key: `RAILWAY-ADMIN-SECURE-2026`) |
| **TTR Officer** | `ttr@railwaypnr.com` | Station Manifest & Waitlist Seat Re-allocation |
| **Pantry Manager** | `pantry@railwaypnr.com` | Catering & Meal Delivery Management |
| **Maintenance Engineer** | `maintenance@railwaypnr.com` | Operations, Incidents & Luggage Tracking |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 20+
- npm or yarn

### 2. Environment Setup
Copy the `.env.example` template:
```bash
cp .env.example .env
```

### 3. Installation & Database Setup
```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Seed initial database records
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🧪 Testing & Code Quality

```bash
# Run unit tests with Vitest
npm test

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint check
npm run lint
```

---

## 🐳 Docker Deployment

To run the application along with PostgreSQL in Docker containers:

```bash
# Build and start containers in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f app
```
The app will be accessible at `http://localhost:3001`.

---

## 🌐 API Reference

### `GET /api/pnr/[pnr]`
Fetch real-time status details for a 10-digit numeric PNR.

**Sample Request**:
```bash
curl -X GET http://localhost:3001/api/pnr/4109857123
```

**Sample Response**:
```json
{
  "success": true,
  "data": {
    "pnr": "4109857123",
    "trainName": "Rajdhani Express",
    "trainNo": "12425",
    "from": "New Delhi",
    "fromCode": "NDLS",
    "to": "Kanpur Central",
    "toCode": "CNB",
    "departureTime": "16:55",
    "arrivalTime": "21:45",
    "date": "23 Dec 2026",
    "class": "AC 3 Tier (3A)",
    "chartStatus": "Chart Prepared",
    "platform": "Platform 16",
    "delayStatus": "On Time",
    "lastUpdated": "2026-08-07T08:00:00.000Z",
    "passengers": [
      { "name": "Ramesh Rathore", "bookingStatus": "CNF / A1 / 25", "currentStatus": "CNF" }
    ]
  }
}
```

---

## 📄 License
Licensed under the MIT License.
