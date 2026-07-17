# 🩺 NutriTracker: Anganwadi Child Nutrition & Growth Monitoring System

NutriTracker is a modern, responsive **MERN (MongoDB, Express, React, Node.js)** web application designed to track and monitor the growth and nutritional status of children in rural Anganwadi centers. It aligns with WHO child development standards and provides automated alerts to help supervisors prevent and manage childhood stunting, wasting, and malnutrition.

## 🚀 Key Features

*   👥 **Role-Based Workflows**:
    *   **Admin Portal**: Register new Anganwadi centers, manage system users, and audit records.
    *   **Worker Portal**: Enroll children, log monthly height/weight measurements, and receive instant growth classifications.
    *   **Supervisor Portal**: Monitor aggregate trends across multiple centers, track monthly malnutrition metrics, and acknowledge/resolve alerts.
*   📊 **WHO Standard Growth Classifications**:
    *   Automatically calculates and flags growth status on every entry using **World Health Organization (WHO)** child growth standards:
        *   **Underweight / Severe Underweight** (Weight-for-Age).
        *   **Stunting / Severe Stunting** (Height-for-Age).
        *   **Wasting / Severe Wasting** (Weight-for-Height).
        *   **Overweight** (Weight-for-Height).
*   📶 **Offline-First PWA Support**:
    *   Anganwadi workers in remote areas can record measurements completely **offline**. 
    *   Transactions are saved to a local sync queue and automatically synchronized with the server when network connectivity is restored.
    *   Intelligent validation automatically discards invalid entries (e.g. height out of bounds) during sync to prevent queue lockups.
*   🍎 **ICMR Hybrid Food Guide & Calorie API**:
    *   A pre-seeded guide containing raw Indian crop ingredients (Ragi, Moong Dal, Palak, whole milk, etc.) and their nutritional profiles mapped to **ICMR (Indian Council of Medical Research)** guidelines.
    *   Includes a live integration with the **Calorie API** for searching raw foods and ingredients globally.
*   📄 **PDF Reports & Visualization**:
    *   Beautiful interactive growth charts (height, weight, and status trends) built with Recharts.
    *   One-click generation of professional PDF report sheets for child files.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Bootstrap 5, Lucide Icons, Axios, Recharts
*   **Backend**: Node.js, Express, Mongoose (MongoDB), Zod (Validation), JWT (Authentication)
*   **PWA**: Service Workers, Cache Storage API, LocalStorage Sync Queue
*   **Database**: MongoDB (Atlas)

---

## ⚙️ Local Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed locally.

### 2. Install Dependencies
Run the following command in the root folder to install dependencies for both the frontend and backend:
```bash
npm run install:all
```

### 3. Environment Variables Configuration
Configure environment variables for both services:

*   **Backend (`backend/.env`)**:
    Create a `.env` file inside the `backend` folder using `backend/.env.example` as a template:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/nutritracker
    JWT_ACCESS_SECRET=your_super_long_random_jwt_secret_key
    JWT_ACCESS_EXPIRES_IN=8h
    CLIENT_ORIGIN=http://localhost:5173
    ```

*   **Frontend (`frontend/.env`)**:
    Create a `.env` file inside the `frontend` folder:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

### 4. Seed Database
Run the seeding script to set up demo centers, workers, supervisors, children records, and growth histories:
```bash
cd backend
npm run seed
```
*(The script will print default access credentials for Admin, Worker, and Supervisor accounts in the terminal).*

### 5. Start Development Servers
Run the dev servers for both frontend and backend from the root directory:
```bash
# Run backend
npm run dev:backend

# Run frontend (in a separate terminal)
npm run dev:frontend
```
Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment

*   **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Free Tier).
*   **Backend API**: Hosted on [Render](https://render.com/) (Web Service).
*   **Frontend Client**: Hosted on [Vercel](https://vercel.com/) (Production Vite Preset).

---

## ✒️ Credits & Author

Designed and Developed by **Disha Gomes** for the Full Stack Development Project.
