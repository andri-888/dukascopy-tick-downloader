require('dotenv').config();

const { getHistoricalRates } = require('dukascopy-node');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');
const path = require('path');

// GLOBAL CONFIGURATION PARAMETERS
const INSTRUMENT = 'eurusd'; 
const START_YEAR = 2005;
const END_YEAR = 2026;
const END_MONTH = 6; 
const COOLDOWN_MS = 60000; // 60 seconds strict cooldown delay
const MAX_RETRIES = 3;     // Maximum download attempts on connection failure
const NETWORK_TIMEOUT_MS = 30000; // 30 seconds hard timeout guard

// Read storage path from local environment configuration
const OUTPUT_DIR = process.env.OUTPUT_DIR;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatUTC(dateObj) {
    return dateObj.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Robust fetch mechanism featuring a strict network timeout barrier
 * and an automated recursive retry policy
 */
async function fetchWithRetry(config, retriesLeft = MAX_RETRIES) {
    const controller = new AbortController();
    
    // Set an automated countdown alarm to force abort the request if hung
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, NETWORK_TIMEOUT_MS);

    try {
        // Inject the abort controller signal into the dukascopy-node configuration matrix
        const data = await getHistoricalRates({
            ...config,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Deactivate the alarm upon successful download execution
        return data;

    } catch (err) {
        clearTimeout(timeoutId); // Deactivate the alarm to clear memory cache leaks

        const isTimeout = err.name === 'AbortError' || err.message.includes('aborted');
        const errorMessage = isTimeout ? 'Network Request Timeout (Server Unresponsive)' : err.message;

        if (retriesLeft <= 1) {
            throw new Error(`[TOTAL FAILURE] Request failed permanently after ${MAX_RETRIES} attempts. Error: ${errorMessage}`);
        }

        console.log(`[RETRY WARN] Connection issue detected (${errorMessage}). Retrying in 5 seconds... (Attempts remaining: ${retriesLeft - 1})`);
        
        await delay(5000); 
        return await fetchWithRetry(config, retriesLeft - 1);
    }
}

/**
 * Main execution engine for automated monthly historical data extraction
 */
async function startAutomatedPipeline() {
    // Structural integrity check for environment configuration
    if (!OUTPUT_DIR || OUTPUT_DIR === "ENTER_YOUR_STORAGE_DIRECTORY_PATH_HERE") {
        console.error("[CRITICAL ERROR] The OUTPUT_DIR target path is not defined in your .env file!");
        process.exit(1);
    }

    // Ensure the destination directory exists locally
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (let year = START_YEAR; year <= END_YEAR; year++) {
        let maxMonth = (year === END_YEAR) ? END_MONTH : 12;
        
        for (let month = 1; month <= maxMonth; month++) {
            const monthStr = String(month).padStart(2, '0');
            const fileLabel = `${INSTRUMENT.toUpperCase()}_${year}_${monthStr}`;
            const targetCsvPath = path.join(OUTPUT_DIR, `${fileLabel}.csv`);
            
            console.log(`\n==================================================================`);
            console.log(`[CHECKING] Inspecting file status: ${fileLabel}.csv`);
            console.log(`==================================================================`);

            // SMART DETECTION: Avoid redundant bandwidth and time consumption
            if (fs.existsSync(targetCsvPath)) {
                console.log(`[SKIP INFO] File ${fileLabel}.csv already exists locally. Skipping network request...`);
                continue; 
            }

            const fromDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
            const toDate = new Date(Date.UTC(year, month, 1, 0, 0, 0)); 

            console.log(`[RUNNING] Target asset file not found. Initiating pipeline...`);
            console.log(`[TIMEFRAME] ${fromDate.toUTCString()} TO ${new Date(toDate - 1).toUTCString()}`);

            try {
                console.log(`[1/3 FETCH] Extracting raw tick data from Dukascopy API...`);
                const ticks = await fetchWithRetry({
                    instrument: INSTRUMENT,
                    dates: {
                        from: fromDate.toISOString(),
                        to: toDate.toISOString()
                    },
                    timeframe: 'tick',
                    format: 'array'
                });

                if (!ticks || ticks.length === 0) {
                    console.log(`[WARN] No data available for this specific period. Moving to cooldown...`);
                } else {
                    console.log(`[2/3 TRANSFORM] Formatting ${ticks.length} data rows into target schema...`);
                    const transformedData = ticks.map(tick => {
                        const [timestamp, ask, bid, askVolume, bidVolume] = tick;
                        return {
                            DateTime: formatUTC(new Date(timestamp)),
                            Bid: bid.toFixed(5),
                            Ask: ask.toFixed(5),
                            Volume: (askVolume + bidVolume).toFixed(2)
                        };
                    });

                    const csvOutput = stringify(transformedData, {
                        header: true,
                        columns: ['DateTime', 'Bid', 'Ask', 'Volume'],
                        delimiter: ','
                    });

                    console.log(`[3/3 SAVE] Committing CSV dataset directly to target storage...`);
                    fs.writeFileSync(targetCsvPath, csvOutput, 'utf8');
                    
                    const fileSizeMB = (fs.statSync(targetCsvPath).size / (1024 * 1024)).toFixed(2);
                    console.log(`[SUCCESS] File successfully committed. File Size: ${fileSizeMB} MB`);
                }

            } catch (err) {
                console.error(`[OPERATIONAL ERROR] ${err.message}`);
                fs.appendFileSync(path.join(OUTPUT_DIR, 'failed_batches.log'), `${year}-${monthStr} : ${err.message}\n`, 'utf8');
            }

            // Termination condition check
            if (year === END_YEAR && month === END_MONTH) {
                console.log(`\n[COMPLETE] Data pipeline has successfully reached the final target boundary.`);
                break;
            }

            // Strict compliance cooldown mechanism to avoid rate-limiting or IP bans
            console.log(`[COOLDOWN] Entering a mandatory 60-second safety delay...`);
            for (let i = COOLDOWN_MS / 1000; i > 0; i -= 10) {
                await delay(10000);
                if (i - 10 > 0) console.log(`[TIMER] ${i - 10} seconds remaining before the next monthly batch...`);
            }
        }
    }
}

startAutomatedPipeline();
