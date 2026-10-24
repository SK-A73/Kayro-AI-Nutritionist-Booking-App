# Kayro AI Product Intern Assignment — Complete Documentation

**Candidate:** Shiva Kumar M  
**Role:** AI Product Intern  
**Project:** Kayro Wellness Appointments System  
**Stack:** React 19, Vite, Supabase PostgreSQL, CSS3 Modules, Vercel  

---

## 1. What We Were Asked

Build a small appointments product for a wellness practice (clinical nutritionist) with two distinct interfaces sharing the same data:
- **Side A: Client App** — Mobile-first, consumer wellness experience showing the client's next appointment, booking consultations without double booking, viewing upcoming/past visits, and rescheduling or cancelling.
- **Side B: Nutritionist Dashboard** — Professional appointment manager displaying client name, phone, date, time, and color-coded status (`Booked`, `Done`, `No-show`), adding appointments manually, filtering today's visits, and synchronizing with Side A in real-time.
- Pre-load with the 5 provided sample records.
- Implement at least one core product mechanism addressing the nutritionist's 25% no-show problem from Part 1.
- Ensure the app is accessible to reviewers without requiring a login.

---

## 2. Your Approach

We designed Kayro as an intentional, warm wellness sanctuary rather than a cold admin utility. Our architectural approach was built on four pillars:

1. **Shared Reactive Data Layer:** A unified service (`appointmentService.js`) abstracts Supabase PostgreSQL with a seamless, persistent local storage fallback. Reviewers can test every flow instantly without needing an external database account, while production can connect to Supabase PostgreSQL by simply adding two environment variables.
2. **Behavioral Psychology at the Center:** Addressed the 25% no-show problem by replacing passive scheduling with active micro-commitments: 1-tap attendance check-in, 1-click WhatsApp practitioner nudges, and 1-tap native calendar export (.ics / Google Calendar).
3. **Mobile-First Warm Aesthetic:** Used soft cream canvas tones (`#FAF7F2`), deep forest greens (`#1E3D2F`), sage accents (`#5E7E6B`), and Playfair Display serif typography to evoke calmness, trust, and mindfulness.
4. **Resilient Data Ingestion:** Standardized non-uniform legacy data from WhatsApp and Excel into clean ISO date and 24-hr time structures.

---

## 3. Decisions and Assumptions (Including How We Handled Sample Data)

### Sample Data Normalization
The sample data provided in the brief contained intentional real-world inconsistencies common in WhatsApp/Excel workflows:
- **Dates:** Varied between `24/10/2026` (DD/MM/YYYY), `2026-10-24` (YYYY-MM-DD), and `25-10-2026` (DD-MM-YYYY).
  - *Decision:* Built a `normalizeDate()` utility that safely parses any delimited string into standard ISO `YYYY-MM-DD` while formatting for the user as localized readable dates (e.g., `Sat, 24 Oct 2026`).
- **Times:** Varied between `4 pm` (12-hr), `11:30am`, `10:00`, `09:00`, and `14:00` (24-hr).
  - *Decision:* Built a `normalizeTime()` utility converting all entries to `HH:mm` 24-hour format internally for conflict checking and sorting, while displaying as friendly `10:00 AM` / `04:00 PM` in the UI.
- **Missing / Varied Phone Numbers:** Meera Iyer had no phone number; Riya Shah and Kabir Rao had varying space patterns (`98200 11111` vs `9820011111`).
  - *Decision:* Formatted 10-digit numbers into standard readable blocks (`98200 11111`) and handled empty numbers gracefully with a fallback `Not provided` label and disabled WhatsApp triggers.
- **Anchor "Today" Context:** The prompt and sample data are contextualized around late October 2026 (`2026-10-24`). We anchored the practice dashboard date to `2026-10-24` so that clicking "Show Today's Visits" immediately highlights Riya Shah and Arjun Mehta's sessions.

---

## 4. What You Added (and Why)

1. **1-Tap Attendance Confirmation Check-In:**
   - *Why:* Gives the nutritionist forward visibility 24 hours prior instead of discovering a no-show while waiting at her desk.
2. **1-Click WhatsApp Practitioner Reminder Link (`wa.me`):**
   - *Why:* Enables the nutritionist to send a personalized, warm attendance check-in directly to the client's WhatsApp in a single click with zero manual typing.
3. **Instant Calendar Sync (Google Calendar URL + Universal `.ics` Download):**
   - *Why:* Overcomes "notification blindness" by placing the consultation directly on the client's device calendar with a 2-hour pre-configured alarm.
4. **"No-Guilt" 2-Click Rescheduling & Cancellation:**
   - *Why:* Clients ghost when they feel guilty apologizing. Allowing self-serve rescheduling immediately frees the time slot for other clients.
5. **Reviewer Demo Client Switcher:**
   - *Why:* Allows the assessment reviewer to toggle between sample client profiles (Riya Shah, Arjun Mehta, Meera Iyer, Kabir Rao) in 1 click without needing authentication.
6. **No-Show Analytics & Historical Rate Badge:**
   - *Why:* Displays clinic KPIs (Total Bookings, Active Visits, No-Show %, Confirmed Attendees) so the practitioner can monitor practice health.
7. **"Reset Sample Data" Control:**
   - *Why:* Allows reviewers to test edge cases, bookings, or status changes, and restore original state with 1 click.

---

## 5. What the AI Got Wrong (and How You Caught and Fixed It)

1. **Initial Vite CSS Contamination:**
   - *What happened:* The starter project retained Vite's default `index.css`, which enforced `#root { text-align: center; border-inline: 1px solid ... }`. This caused cards to center-align awkwardly and misaligned form labels.
   - *How caught & fixed:* Caught during visual inspection of the running server. Replaced `index.css` with a dedicated CSS reset and design tokens.
2. **Missing Reschedule and Cancellation Capabilities:**
   - *What happened:* The initial starter only rendered a static list of appointments without edit actions, completely missing prompt requirement #3 (*"See upcoming and past appointments. Reschedule or cancel an upcoming one"*).
   - *How caught & fixed:* Built `RescheduleModal.jsx` and `CancelModal.jsx` with slot conflict validation.
3. **Date/Time String Sorting Bugs:**
   - *What happened:* Lexicographical sorting on mixed formats like `24/10/2026` vs `2026-10-24` placed October 24 after October 25.
   - *How caught & fixed:* Standardized all internal comparison routines to use normalized ISO `YYYY-MM-DD` and `HH:mm`.
4. **Client-Specific Filtering Confusion:**
   - *What happened:* The initial code showed all practice appointments under the client's "Journey" view if no client name was entered.
   - *How caught & fixed:* Added the Reviewer Demo Client Selector and filtered journey records strictly by selected client.

---

## 6. How to Run It

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Quick Start (Local Development)
```bash
# 1. Clone repository
git clone https://github.com/your-username/kayro-appointments.git
cd kayro-appointments

# 2. Install dependencies
npm install
cd kayro-appointments && npm install && cd ..

# 3. Start local development server
npm run dev
```
Open **`http://localhost:5173`** in your browser. The app runs immediately with all sample data preloaded!

### Optional: Connecting Supabase PostgreSQL
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor in Supabase and run the script in `kayro-appointments/supabase-schema.sql`.
3. In `kayro-appointments/kayro-appointments`, create a `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Restart the dev server (`npm run dev`). The database indicator will display `🟢 Supabase Live`.

### Production Build & Deployment (Vercel)
```bash
npm run build
```
Live Production URL: **https://kayro-appointments.vercel.app**
GitHub Repository: **https://github.com/SK-A73/Kayro-AI-Nutritionist-Booking-App**

Deploy directly by importing the GitHub repository into Vercel. `vercel.json` is configured for zero-config Vite deployments.
