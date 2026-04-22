/**
 * Displays a given message or value to the standard output.
 * This utility function ensures consistent output formatting.
 * @param {any} contentToDisplay - The data or message to be logged to the console.
 */
function displayProcessedResult(contentToDisplay) {
    console.log(contentToDisplay);
}

// --- Configuration Constants (Type III Addition) ---
// Define the fixed conversion rate for Bitcoin to Japanese Yen.
const BITCOIN_TO_JPY_RATE = 380000.0;
// Standardized currency codes for comparison.
const JPY_CURRENCY_CODE_IDENTIFIER = "JPY";
const BTC_CURRENCY_CODE_IDENTIFIER = "BTC"; // Assumed for any non-JPY currency

/**
 * Orchestrates the parsing of raw financial transaction data from a string
 * and computes the total accumulated value in Japanese Yen.
 * This function includes robust input validation and intermediate data structuring.
 *
 * @param {string} rawInputString - The complete input string, typically from standard input,
 *                                  containing transaction details across multiple lines.
 */
function ProcessFinancialTransactions(rawInputString) {
    // --- Input Pre-processing and Initial Validation (Type III Additions) ---
    if (!rawInputString || rawInputString.trim().length === 0) {
        console.error("Error: Input data stream is empty or contains only whitespace.");
        displayProcessedResult(0.0); // Output a default value on error
        return;
    }

    const allDataLines = rawInputString.trim().split('\n');

    if (allDataLines.length === 0) {
        console.error("Error: No meaningful data lines found after initial parsing.");
        displayProcessedResult(0.0);
        return;
    }

    // Extract the expected number of transaction entries from the first line.
    const expectedNumberOfEntries = Number.parseInt(allDataLines[0], 10);

    // Validate the extracted count (Type III Guard Clause)
    if (Number.isNaN(expectedNumberOfEntries) || expectedNumberOfEntries < 0) {
        console.error(`Error: The first line "${allDataLines[0]}" does not contain a valid positive number for entries.`);
        displayProcessedResult(0.0);
        return;
    }

    // Isolate the actual transaction entries, excluding the count line.
    // This improves clarity for subsequent processing steps.
    const transactionEntryLines = allDataLines.slice(1, expectedNumberOfEntries + 1);

    // Warn if the number of actual entries doesn't match the declared count (Type III Validation)
    if (transactionEntryLines.length !== expectedNumberOfEntries) {
        console.warn(`Warning: Declared ${expectedNumberOfEntries} entries, but found ${transactionEntryLines.length}. Processing available entries.`);
    }

    // --- Intermediate Data Structure Transformation (Significant Type III Change) ---
    // Convert raw text lines into a structured array of objects for easier processing.
    const structuredTransactions = transactionEntryLines.map((lineContent, lineIndex) => {
        // Use a regex to split by one or more whitespace characters for robustness.
        const lineParts = lineContent.split(/\s+/);

        // Validate the structure of each line (Type III Guard Clause)
        if (lineParts.length < 2) {
            console.warn(`Skipping malformed transaction entry at line ${lineIndex + 2} (original input line): "${lineContent}"`);
            return null; // Mark as null to be filtered out later
        }

        const numericalAmount = Number.parseFloat(lineParts[0]);
        const currencyIdentifier = lineParts[1].toUpperCase(); // Standardize currency code to uppercase

        // Validate the numerical amount (Type III Guard Clause)
        if (Number.isNaN(numericalAmount)) {
            console.warn(`Skipping transaction entry at line ${lineIndex + 2} due to invalid numerical value: "${lineParts[0]}"`);
            return null;
        }

        // Return a clean object representing the transaction.
        return {
            transactionValue: numericalAmount,
            currencyType: currencyIdentifier
        };
    }).filter(entry => entry !== null); // Remove any entries that were marked as null due to errors.

    // --- Core Calculation Logic (Type III Refactoring and Updates) ---
    let totalAccumulatedYenValue = 0.0; // Use 'let' for mutable accumulator, explicit float.

    // Iterate over the clean, structured transaction data.
    for (const singleTransaction of structuredTransactions) {
        // Use a switch statement for extensible currency handling (Type III Update).
        switch (singleTransaction.currencyType) {
            case JPY_CURRENCY_CODE_IDENTIFIER:
                totalAccumulatedYenValue += singleTransaction.transactionValue;
                break;
            case BTC_CURRENCY_CODE_IDENTIFIER:
                totalAccumulatedYenValue += singleTransaction.transactionValue * BITCOIN_TO_JPY_RATE;
                break;
            default:
                // Handle unknown currency types gracefully (Type III Validation/Error Handling).
                console.warn(`Unknown currency type "${singleTransaction.currencyType}" encountered. Skipping transaction with value ${singleTransaction.transactionValue}.`);
                // No addition to totalAccumulatedYenValue for unknown types.
                break;
        }
    }

    // --- Final Output (Type III Update) ---
    // Format the final result to a fixed number of decimal places for financial precision.
    displayProcessedResult(totalAccumulatedYenValue.toFixed(8));
}

// --- Main Program Execution (Type III Updates) ---
// Read input from standard input stream, typically "/dev/stdin" in competitive programming environments.
// Encapsulate file reading in a try-catch block for robust error handling.
try {
    const rawStandardInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    ProcessFinancialTransactions(rawStandardInput);
} catch (fileSystemError) {
    console.error("An error occurred while reading from standard input:", fileSystemError.message);
    displayProcessedResult(0.0); // Ensure an output is always provided even on input failure.
}