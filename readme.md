# Automated Monthly Historical Tick Data Downloader

A highly robust, institutional-grade Node.js data pipeline engine designed to extract high-frequency historical tick data from Dukascopy servers. It automatically segments data extraction into clean monthly intervals, formats datasets into standardized schemas, handles erratic network behavior gracefully via recursive retry strategies, and operates with a built-in strict compliance cooldown mechanism to mitigate server-side rate limits or IP bans.

---

## Key Engineering Features 

- **Dynamic Chronological Iteration:** Automatically loops month-by-month from a defined start point (January 2005) up to the target boundary (June 2026). It natively resolves variable month lengths and leap years (e.g., February 29).
- **Smart Detection Pipeline (Auto-Skip):** Scans the local target storage directory before initiating any network handshakes. Existing monthly `.csv` datasets are skipped instantly to avoid redundant bandwidth consumption.
- **Fault-Tolerant Auto-Retry:** If a connection timeout or network drop (`fetch failed`) occurs, the engine initiates up to 3 recursive attempts with progressive short delays before logging a failure.
- **Strict Compliance Cooldown:** Enforces a mandatory 60-second safety cooldown delay between successful monthly batches to ensure zero-tolerance policy against server-side throttling.
- **Data Privacy & Portability:** Isolates your sensitive, machine-specific paths from public exposure using local environment orchestration.

---

## Data Schema Specification

Every generated CSV file enforces a rigid, high-frequency execution schema:
- **Columns:** `DateTime`, `Bid`, `Ask`, `Volume`
- **TimeZone:** Locked strictly to Coordinated Universal Time (UTC)
- **Data Formatting:** Five-decimal precision for prices (`Bid`/`Ask`), and two-decimal precision for `Volume`.
- **Volume Calculation:** Aggregated trading volume calculated deterministically as:
  $$\text{Volume} = \text{bidVolume} + \text{askVolume}$$

---

## Project Structure

```text
dukascopy-tick-downloader/
├── node_modules/         # Local dependency binaries (Excluded from Git)
├── .env                  # Private local paths configuration (Excluded from Git)
├── .env.example          # Public configuration template for users
├── .gitignore            # Git exclusion rules manifest
├── downloader.js         # Core automation engine script
├── LICENSE               # MIT Open Source License documentation
└── README.md             # Project documentation manual

```

---

## Installation & Setup Tutorial

### 1. Verification of Prerequisites

Ensure you have Node.js (LTS version highly recommended) deployed on your operating system. Verify via your system terminal:

```bash
node -v

```

### 2. Dependency Deployment

Navigate to your isolated project repository directory and install the required core packages:

```bash
npm install

```

### 3. Environment Variable Orchestration

To protect personal file directory data, you must establish a local configuration layer:

* **For macOS or Linux Terminal:**
```bash
cp .env.example .env

```


* **For Windows Command Prompt (CMD):**
```cmd
copy .env.example .env

```



Open the newly generated `.env` file using a preferred text editor and configure your specific local storage folder path.

*macOS Target Absolute Path Example:*

```env
OUTPUT_DIR="/Users/your_username/Library/CloudStorage/OneDrive-Personal/MT5-Software/Historical_Data/EURUSD/"

```

---

## Production Execution

To run the automated downloader pipeline engine in your system terminal environment, fire the execution command:

```bash
node downloader.js

```

### Process Lifecycle Terminal Logs:

```text
==================================================================
[CHECKING] Inspecting file status: EURUSD_2005_01.csv
==================================================================
[RUNNING] Target asset file not found. Initiating pipeline...
[TIMEFRAME] Sat, 01 Jan 2005 00:00:00 GMT TO Mon, 31 Jan 2005 23:59:59 GMT
[1/3 FETCH] Extracting raw tick data from Dukascopy API...
[2/3 TRANSFORM] Formatting 2453210 data rows into target schema...
[3/3 SAVE] Committing CSV dataset directly to target storage...
[SUCCESS] File successfully committed. File Size: 112.45 MB
[COOLDOWN] Entering a mandatory 60-second safety delay...
[TIMER] 50 seconds remaining before the next monthly batch...

```

---

## Open-Source Licensing

This software asset is distributed under the open-source **MIT License**. You are free to modify, distribute, and implement this codebase for both personal and high-scale commercial operations. Please refer to the `LICENSE` file for the exact boundaries of liability waiver.

---
