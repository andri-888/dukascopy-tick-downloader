# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-07-01

### Added
- **Smart Detection Pipeline (Auto-Skip):** Implemented native directory scanning using `fs.existsSync`. The engine now automatically skips existing monthly `.csv` data chunks to optimize bandwidth and prevent redundant server calls.
- **Cross-Platform Compatibility:** Enhanced documentation across `README.md` to cleanly support setup execution paths for Windows Command Prompt (`copy`) alongside macOS/Linux (`cp`).
- **Open-Source Licensing:** Dispatched official project governance framework by embedding the MIT License model.

---

## [1.1.0] - 2026-06-30

### Added
- **Fault-Tolerant Retry Policy:** Implemented a robust recursive connection rescue system (`fetchWithRetry`) featuring up to 3 automated network re-fetch attempts with progressive short delays to resolve erratic `fetch failed` drops.
- **Environment Isolation Configuration:** Integrated `dotenv` dependency package to abstract machine-specific absolute storage paths (e.g., local OneDrive paths) out of the open-source codebase for maximum data privacy.
- **Localization Refactoring:** Completely re-engineered terminal console telemetry logs, code variables, structural inline documentation, and system warning errors into standard professional English.

---

## [1.0.0] - 2026-06-29

### Added
- **Automated Sequential Loop Engine:** Established core structural loop logic (`for` matrix) to sequentially pull data from January 2005 up to June 2026 without requiring manual execution variables.
- **Deterministic Date Resolution:** Deployed native Javascript `Date` mechanisms to handle variable month lengths and leap years (e.g., February 29) dynamically.
- **Strict Compliance Cooldown Cores:** Embedded a hard-coded 60-second asynchronous delayed timer to safeguard pipeline operations against server-side rate limits or IP restrictions.
- **Target Schema Formatting:** Configured a pipeline formatter using `csv-stringify` to enforce the requested structural schema output (`DateTime` in UTC, `Bid`, `Ask`, and aggregated volume calculations).
- **Direct Local Cloud Storage Traversal:** Configured the output stream file system to dump compiled datasets straight into the local macOS OneDrive active cache folder structure.
