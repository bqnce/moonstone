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

---

<details>
<summary><strong>🚀 Changelog — 2026-01-05</strong></summary>

### ♻️ Architecture & Refactoring
- **Separation of Concerns:** Major refactor across `History`, `Salary`, `Login`, and `Wallets` pages.
  - Split monolithic `page.tsx` files into **Logic Controllers** (state/fetching) and **UI Components** (presentation).
  - UI components moved to dedicated `_components` folders for better maintainability and security.
- **Directory Structure:** Standardized the project structure to follow the "Feature-Sliced" pattern.

### 🦊 Wallets & Integrations
- **Dynamic Token Detection:**
  - **MetaMask:** Implemented **Alchemy Enhanced API** to automatically fetch and recognize all ERC-20 tokens held by the user (replacing hardcoded ETH-only logic).
  - **Phantom:** Upgraded **Helius API** integration to dynamically list all SPL tokens (including custom tokens like $UNITY).
- **Smart Sorting:** Token lists in the UI are now automatically sorted by **USD Value** (descending order).
- **UI Polish:** Removed fractional digits from USD values for a cleaner, minimalist aesthetic (rounded to whole numbers).

### 💱 Live Data & Currency
- **Dynamic Exchange Rates:**
  - Introduced `useCurrencyRates` hook to fetch live **USD/HUF** and **EUR/USD** rates via a public API.
  - Replaced hardcoded exchange rate constants in `Dashboard` and `Accounts` pages.
  - **Net Liquidity** calculation now reflects real-time market conditions automatically.

### 🎨 UI/UX Improvements
- **Sidebar Redesign:** Updated the user profile footer for a modern, sleek look (removed generic badges, improved avatar styling and hover states).
- **Interactive Feedback:** Added a stylish `react-hot-toast` notification when copying wallet addresses to the clipboard.

</details>

<details>
<summary><strong>🚀 Changelog — 2026-01-06</strong></summary>

### 🔐 Authentication
- **New Register Page:** Built a fully component-based `/register` page matching the Login design system (Header, Form, Footer) with smooth entrance animations.
- **Layout Control:** Updated `ClientLayout` to strictly hide the Sidebar on the registration route.

### 💸 Accounts & Assets
- **Full CRUD System:**
  - **Create:** Added `AddAssetModal` with custom-built dropdowns (replacing native select) and clean number inputs.
  - **Delete:** Implemented quick-delete functionality via the asset card context menu with Toast feedback.
  - **Update:** Refactored `EditBalanceModal` for seamless balance adjustments.
- **UI/UX Improvements:**
  - **Smart Grouping:** Assets are now visually categorized (Bank, Cash, Investment) instead of a flat list.
  - **Onboarding:** Designed high-quality "Empty State" cards guiding new users to add assets or connect wallets.
  - **Interactivity:** Implemented "click-outside" logic to automatically close Modals and Dropdowns.

### 🦊 Wallets
- **Smart Connection Grid:**
  - **Dynamic View:** Displays large "Connect" onboarding cards when disconnected, switching to detailed Asset cards upon connection.
  - **Visual Polish:** Replaced generic emojis with high-quality **MetaMask & Phantom logos** with proper fallback logic.
  - **Layout:** Removed internal scrollbars from token lists; cards now expand dynamically to fit content.

### ⚙️ Core & Backend
- **Currency System:** Implemented a standalone `useCurrency` hook (localStorage based) to toggle global display between **USD** and **HUF**.
- **API Expansion:** Added robust `POST` and `DELETE` endpoints to `/api/accounts` for manual asset management.

</details>