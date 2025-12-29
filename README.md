<details>
<summary><strong>🚀 Changelog — 2025-12-28</strong></summary>

### ✨ New Features
- **📜 First-Class Audit Layer:** Implemented a robust Event Log system to track every balance change as an immutable record.
- **🔄 History API:** Added `GET /api/events` with pagination, filtering (source/category), and timestamp sorting.
- **💰 Salary Injection Flow:**
  - Secure `POST` endpoint for salary handling.
  - Server-side balance calculation (Zero-Trust Client model).
  - Immutable event creation prior to state mutation.
- **🧪 Sandbox Testing:** Added a dedicated `SalaryTest` route for safe backend isolation testing.

### 🛡️ Architecture & Security
- **Server-Side Truth:**
  - `userId` is strictly derived from the Auth Session (never accepted from client).
  - Currency and Category resolution is enforced via DB state lookup.
- **Event Sourcing Pattern:**
  - Decoupled state (Account Balance) from history (Event Log).
  - Tracks `delta`, `balanceAfter`, and `source` (MANUAL / SALARY / ONCHAIN).

### 🗄️ Database & Fixes
- **New Schema:** Dedicated `Event` collection designed for replayable balance states.
- **Typing:** Fixed TypeScript definitions for the database connection layer.
</details>

---

<details>
<summary><strong>🚀 Changelog — 2025-12-29</strong></summary>

### 💎 Core Features
- **Salary Injection System (Zero UI):**
  - Dedicated `/salary` page with a focused, distraction-free interface.
  - **Smart Conversion:** Input amount in **HUF** automatically converts to **EUR** if the target account currency differs.
  - **Historical Records:** Added a toggle to log past income without affecting the current live balance (Ghost Entries).
  - **Period Tracking:** Users can now specify the reference month (e.g., "August 2025") for every salary entry.

- **Advanced History & Audit Log:**
  - **Smart Table UI:** Replaced raw logs with a professional data table (`tabular-nums`, monospace fonts).
  - **Visual Context:** Source badges (Salary, Manual, On-Chain) with distinct color coding.
  - **Metadata Support:** Displays the specific salary month directly in the transaction list.
  - **Dynamic Filtering:** Filter chips to toggle between `All`, `Salary`, and `Manual` events instantly.
  - **Live Totals:** Added a `<tfoot>` summary that calculates the total delta of visible rows per currency.

### 🛡️ Architecture & Backend
- **Event Sourcing Pattern:**
  - Every balance change is now an immutable event.
  - **Zero-Trust Model:** The frontend only submits *intent* (ID + Amount). The backend resolves current state and performs all calculations.
- **Manual Balance Updates:**
  - Migrated manual edits to a secure `POST /api/accounts/update-balance` route.
  - Automatically logs these changes as `SOURCE: MANUAL` events with calculated deltas.
- **Database Schema Upgrade:**
  - Updated `EventSchema` to support a structured `metadata` object (replacing the strict Map type) for better JSON serialization.
  - Standardized usage of MongoDB `_id` over string labels for robust account identification.

### 🐛 Bug Fixes & Refactoring
- **Fix:** Resolved `CastError` where the frontend was sending account labels instead of ObjectIDs.
- **Fix:** Fixed Mongoose schema caching issue where new fields (`metadata`) were not being saved in dev mode.
- **Refactor:** Decoupled `HistoryPage` fetching logic to support query-based filtering (`?source=SALARY`).

</details>