# Automated Dukascopy Monthly Tick Data Downloader

A robust, enterprise-grade Node.js automated data pipeline designed to extract high-frequency historical tick data from the Dukascopy server. It segments downloads into automated monthly intervals, formats datasets into standard institutional parameters, handles network errors gracefully via a recursive retry mechanism, and operates with a built-in rate-limiting compliance system.

## Performance & Guardrail Features
- **Smart File Detection (Auto-Skip):** Scans the target storage folder prior to initializing network fetch. Automatically skips existing monthly datasets to optimize bandwidth and speed.
- **Fault-Tolerant Auto-Retry:** Automatically attempts to re-fetch data up to 3 times with short progressive delays if a network interruption (`fetch failed`) occurs.
- **Rate-Limiting Compliance:** Enforces a mandatory strict 60-second cooldown timer between each successful monthly batch to prevent server rate-limiting or IP restrictions.
- **Dynamic Date Resolution:** Programmatically resolves month boundaries, including leap years (e.g., February 29).

## Data Schema & Specifications
The output dataset is committed to a structured CSV format with the following precise schema configurations:
- **Columns:** `DateTime`, `Bid`, `Ask`, `Volume`
- **TimeZone:** Locked strictly to Coordinated Universal Time (UTC)
- **Volume Calculation:** Summation of Bid Volume and Ask Volume (`bidVolume + askVolume`)

## Installation & Setup

### 1. Prerequisites
Ensure you have Node.js (LTS version recommended) installed on your system.

### 2. Clone and Install Dependencies
Navigate to your project directory and install the package requirements:
```bash
npm install