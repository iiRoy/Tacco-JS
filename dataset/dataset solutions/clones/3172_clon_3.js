// This function serves as the primary entry point for processing financial transaction records.
// It receives all raw input data as a single string.
function processFinancialRecords(inputStringData) {
    // Constants are defined to improve readability and maintainability.
    const CURRENCY_JAPANESE_YEN = 'JPY';
    const CURRENCY_BITCOIN = 'BTC';
    // A hypothetical conversion rate for Bitcoin to Japanese Yen.
    const BITCOIN_TO_YEN_CONVERSION_RATE = 380000.0;

    // A preliminary check to ensure the input data is valid and not empty.
    // If the input is not a non-empty string, an error is logged, and the function exits.
    if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
        console.error("Input data is either missing, not a string, or completely empty. Processing halted.");
        return;
    }

    // The entire input string is split into an array of individual lines.
    // This allows for line-by-line processing of the financial records.
    const transactionRecordLines = inputStringData.split("\n");

    // The very first line of the input is expected to contain the total count
    // of subsequent transaction entries. This value is parsed into an integer.
    const declaredEntryCountString = transactionRecordLines[0];
    let actualTransactionCount = Number.parseInt(declaredEntryCountString, 10);

    // Validate the parsed count. If it's not a valid number or is negative,
    // a warning is issued, and the count is reset to zero to prevent errors.
    if (Number.isNaN(actualTransactionCount) || actualTransactionCount < 0) {
        console.warn(`The declared number of entries (${declaredEntryCountString}) is invalid. Assuming zero transactions.`);
        actualTransactionCount = 0;
    }

    // Variables are initialized to accumulate the total amounts for each currency type.
    // Japanese Yen amounts are typically handled as integers.
    let accumulatedYenTotal = 0;
    // Bitcoin amounts often involve decimal places, so a float is used.
    let accumulatedBitcoinUnits = 0.0;

    // Loop through each expected transaction record.
    // The loop starts from index 0 up to (but not including) the actualTransactionCount,
    // accessing lines from transactionRecordLines[1] onwards.
    for (let currentLineIndex = 0; currentLineIndex < actualTransactionCount; currentLineIndex++) {
        // Fetch the current transaction line from the array.
        // We add 1 to currentLineIndex because the first line (index 0) was the count.
        const recordLineContent = transactionRecordLines[currentLineIndex + 1];

        // Skip any lines that are empty, undefined, or just whitespace.
        if (!recordLineContent || recordLineContent.trim() === '') {
            console.warn(`Skipping an empty or whitespace-only line at input index ${currentLineIndex + 1}.`);
            continue; // Move to the next iteration.
        }

        // Each transaction line is expected to have two parts: a numeric value and a currency code,
        // separated by a space.
        const lineComponents = recordLineContent.split(' ');

        // Validate that the line has the expected number of components.
        if (lineComponents.length < 2) {
            console.warn(`Malformed transaction record found at line ${currentLineIndex + 1}: '${recordLineContent}'. Skipping this entry.`);
            continue;
        }

        // Extract the value string and the currency identifier from the components.
        const valueComponent = lineComponents[0];
        const currencyComponent = lineComponents[1];

        // Use a conditional structure to process based on the currency type.
        if (currencyComponent === CURRENCY_JAPANESE_YEN) {
            // Parse the value as an integer for JPY.
            const yenValue = Number.parseInt(valueComponent, 10);
            // Check if the parsed value is a valid number before adding to the total.
            if (!Number.isNaN(yenValue)) {
                accumulatedYenTotal += yenValue;
            } else {
                console.warn(`Failed to parse JPY value '${valueComponent}' on line ${currentLineIndex + 1}. This entry will not be included.`);
            }
        } else if (currencyComponent === CURRENCY_BITCOIN) {
            // Parse the value as a float for BTC.
            const bitcoinValue = Number.parseFloat(valueComponent);
            // Check for valid number before accumulating.
            if (!Number.isNaN(bitcoinValue)) {
                accumulatedBitcoinUnits += bitcoinValue;
            } else {
                console.warn(`Failed to parse BTC value '${valueComponent}' on line ${currentLineIndex + 1}. This entry will not be included.`);
            }
        } else {
            // Log a warning if an unrecognized currency identifier is encountered.
            console.warn(`Encountered an unknown currency type '${currencyComponent}' on line ${currentLineIndex + 1}. This entry is being ignored.`);
        }
    }

    // After processing all records, calculate the final sum.
    // Bitcoin units are converted to Yen using the defined rate, then added to the total Yen.
    const grandTotalInYen = accumulatedYenTotal + (accumulatedBitcoinUnits * BITCOIN_TO_YEN_CONVERSION_RATE);

    // Display the final calculated aggregate value.
    console.log(grandTotalInYen);
}

// The following section is for standard input/output handling and should not be altered.
// It reads all data from standard input at once and passes it to the processing function.
processFinancialRecords(require("fs").readFileSync("/dev/stdin", "utf8"));