## 🚀 Changelog — 2025-12-29

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

---