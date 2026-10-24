# 🌿 Kayro Wellness · Appointments Booking & Practice Management

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A thoughtful, premium wellness appointment booking experience designed for holistic clinical nutritionists and their clients. Built for the **Kayro AI Product Intern Assignment**.

---

## 🌟 Live Demo & Assessment Review Mode

- **Live Production URL:** [https://kayro-appointments.vercel.app](https://kayro-appointments.vercel.app)
- **GitHub Repository:** [https://github.com/SK-A73/Kayro-AI-Nutritionist-Booking-App](https://github.com/SK-A73/Kayro-AI-Nutritionist-Booking-App)
- **Reviewer Friendly:** No authentication or login required!
- **Two Interfaces in One Web App:** Instantly toggle between:
  - **Side A: Client App** (A mobile-first, calming wellness booking flow)
  - **Side B: Nutritionist Dashboard** (A high-efficiency consultation desk with WhatsApp reminders and no-show intelligence)
- **Bidirectional Real-Time Sync:** Book, reschedule, or cancel on Side A, and watch it appear live on Side B immediately.
- **Pre-Loaded Sample Data:** Seeded with all 5 required assignment records (Riya Shah, Arjun Mehta, Meera Iyer, Kabir Rao).

---

## 💡 Solving the 25% No-Show Problem (Part 1 Solution)

In a typical practice managed via WhatsApp and Excel, **1 in 4 clients simply do not show up**. The nutritionist only discovers this after sitting and waiting.

Kayro solves this through a compassionate, low-friction behavioral system:

1. **1-Tap Attendance Confirmation Check-In:**
   - Upcoming appointments display a gentle check-in prompt: *"Can you still make it? [✓ Confirm My Attendance]"*.
   - When tapped, the database turns the badge **Green (Confirmed)**, giving the practitioner forward peace of mind 24 hours prior.
2. **1-Click WhatsApp Reminder Links (`wa.me`):**
   - On the Nutritionist Dashboard, every booked appointment has a 1-click **"Nudge"** button that pre-composes a warm, personalized WhatsApp check-in with zero typing.
3. **Native Device Calendar Sync (Google Calendar + `.ics`):**
   - 1-click calendar links add the consultation to the client's Apple Calendar, Google Calendar, or Outlook with a pre-configured 2-hour notification alert.
4. **"No-Guilt" 2-Click Rescheduling:**
   - Clients ghost when they feel guilty apologizing. Allowing them to self-serve a new slot in 2 clicks removes social friction and instantly frees up their old slot for waitlisted clients.
5. **Upfront Consultation Focus (Micro-Commitment):**
   - Selecting their primary wellness goal (*Gut Health*, *PCOS*, *Sports Nutrition*) triggers Cialdini's consistency principle, increasing psychological skin in the game.

---

## 📱 Feature Breakdown

### Side A: Client App (Mobile-First Wellness Experience)
- **Next Visit Spotlight Card:** Highlights upcoming consultation date, time, duration, and practitioner note.
- **Consultation Booking:** Select date, pick available time slots (taken slots are automatically disabled to prevent double-booking), enter name and phone, and pick a focus area.
- **Double Booking Prevention:** Client and database validation guarantees no overlapping slots.
- **Appointment History & Journey:** Filter between upcoming visits and past consultation history.
- **Self-Serve Rescheduling & Cancellation:** Accessible modal to change times or cancel with instant slot release.
- **Reviewer Client Switcher:** Easily test the experience as *Riya Shah*, *Arjun Mehta*, *Meera Iyer*, or *Kabir Rao*.

### Side B: Nutritionist Dashboard (Clinical Practice Management)
- **Practice Overview Analytics:** Key performance metrics including Total Visits, Active Bookings, Completed Visits, and **Historical No-Show Rate %**.
- **Filter by Today Only:** 1-click filter instantly shows visits for the current clinic day.
- **Live Status Management:** Seamlessly change appointment status between `Booked`, `Done`, `No-show`, or `Cancelled` with distinct color-coded badges.
- **Manual Booking ("Add by Hand"):** Quick reception desk form with complete slot conflict protection.
- **Search & Filter:** Search by client name, phone number, or consultation topic.
- **1-Click WhatsApp Reminders:** Deep-linked `wa.me` triggers pre-formatted client reminder messages.
- **Reviewer "Reset to Sample Data":** Instant button to restore original assessment dataset at any time.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 19, Vite 8, JavaScript (ESModules)
- **Icons & Polish:** Lucide React, Canvas Confetti
- **Styling:** Modular responsive CSS using custom design tokens, warm cream backgrounds (`#FBF9F4`), deep forest green (`#1E3D2F`), sage green (`#5E7E6B`), and Playfair Display serif typography.
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) & real-time replication.
- **Offline / Review Fallback:** Reactive `localStorage` data service (`appointmentService.js`) ensuring seamless evaluation even if Supabase environment variables are omitted.
- **Deployment:** Vercel with zero-configuration build rules (`vercel.json`).

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/kayro-appointments.git
cd kayro-appointments
```

### 2. Install dependencies
```bash
npm install
cd kayro-appointments && npm install && cd ..
```

### 3. Start local development server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

The application includes an instant persistent store for reviewers out of the box. To connect your own live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `kayro-appointments/supabase-schema.sql`.
3. Create a `.env` file in `kayro-appointments/kayro-appointments/`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart your development server (`npm run dev`). The top indicator will show `🟢 Supabase Live`.

---

## 📦 Project Structure

```
kayro-appointments/
├── PART_1_SOLUTION.md         # Part 1: Detailed solution to the 25% no-show puzzle
├── DOCUMENTATION.md           # Assessment documentation covering all 6 required headings
├── CHAT_LOG.md                # AI build logs and conversation history
├── vercel.json                # Vercel deployment configuration
├── package.json               # Root scripts
└── kayro-appointments/        # Vite + React application
    ├── public/                # Static assets & favicons
    ├── src/
    │   ├── assets/            # Brand imagery
    │   ├── components/
    │   │   ├── Navbar.jsx           # Topbar & view switcher
    │   │   ├── ClientApp.jsx        # Side A: Consumer booking experience
    │   │   ├── Dashboard.jsx        # Side B: Nutritionist management desk
    │   │   ├── RescheduleModal.jsx  # Slot-checked rescheduling modal
    │   │   └── CancelModal.jsx      # Friendly cancellation modal
    │   ├── data/
    │   │   └── initialData.js       # Normalized sample dataset & date/time parsers
    │   ├── lib/
    │   │   └── supabase.js          # Supabase client initializer
    │   ├── services/
    │   │   └── appointmentService.js# Unified reactive data layer
    │   ├── utils/
    │   │   └── calendarAndWhatsapp.js# Google Cal, .ics & WhatsApp generators
    │   ├── App.css                  # Custom styling & wellness design tokens
    │   ├── index.css                # CSS reset & font definitions
    │   ├── App.jsx                  # Main application orchestrator
    │   └── main.jsx                 # React root mount
    ├── supabase-schema.sql    # PostgreSQL schema with RLS & sample inserts
    ├── .env.example           # Supabase environment variables template
    └── vite.config.js         # Vite configuration
```

---

## 📄 Submission Documents

- **Part 1 Answer (PDF):** `Kayro_Part1_The_Puzzle_Solution.pdf`
- **Documentation (PDF):** `Kayro_AI_Product_Intern_Documentation.pdf`
- **Chat Log:** `CHAT_LOG.md`
- **Live Deployment:** Deployed on Vercel

---

## 👤 Author

**Shiva Kumar M**  
*AI Product Intern Candidate · Kayro AI*
