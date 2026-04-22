"use strict"; // Enforce strict parsing and error handling in the script.

// Define a constant for the Bitcoin exchange rate for improved maintainability and clarity.
// This value represents the current exchange rate of 1 Bitcoin (BTC) in the base fiat currency.
const BITCOIN_FIAT_CONVERSION_RATE = 380000.0;

/**
 * Orchestrates the processing of financial transaction data provided as a raw string.
 * It parses transaction entries, applies necessary conversions, and computes a final aggregate sum.
 *
 * @param {string} sourceContentBlock - The complete block of input data, where the first line
 *                                      specifies the total number of subsequent transactions.
 */
function ProcessFinancialTransactions(sourceContentBlock) {
    // Normalize and segment the input: remove leading/trailing whitespace and split into individual lines.
    const transactionRecords = sourceContentBlock.trim().split('\n');

    // Implement a preliminary guard clause to ensure there is input data to process.
    if (transactionRecords.length === 0) {
        console.error("Critical Error: No input content was provided for processing.");
        return; // Terminate execution if no data.
    }

    // Extract the total count of expected operations from the first line of the input.
    // Use `parseInt` with a radix of 10 for robust integer conversion.
    const totalExpectedOperations = parseInt(transactionRecords[0], 10);

    // Validate the parsed number of operations to prevent erroneous computations.
    if (isNaN(totalExpectedOperations) || totalExpectedOperations < 0) {
        console.error("Validation Error: The specified number of operations in the first line is invalid.");
        return;
    }

    // Initialize an accumulator for the grand total, ensuring it's a floating-point number
    // to accommodate potential decimal values from calculations.
    let aggregatedFinalSum = 0.0;

    // Iterate through each individual transaction record. The loop starts from the first transaction
    // (which is at index 1 in the `transactionRecords` array, as index 0 holds the count).
    for (let currentTransactionIdx = 0; currentTransactionIdx < totalExpectedOperations; currentTransactionIdx++) {
        // Retrieve the current line representing a single transaction.
        // The actual index for the transaction line is `currentTransactionIdx + 1`.
        const currentTransactionLine = transactionRecords[currentTransactionIdx + 1];

        // Add a safety check: ensure the transaction line actually exists.
        // This handles cases where the input might be shorter than `totalExpectedOperations`.
        if (!currentTransactionLine) {
            console.warn(`Data Warning: Transaction line ${currentTransactionIdx + 2} is missing. Skipping this entry.`);
            continue; // Proceed to the next iteration.
        }

        // Deconstruct the transaction line into its constituent parts: value and currency type.
        // Splitting by one or more whitespace characters (`/\s+/`) ensures robustness.
        const recordComponents = currentTransactionLine.split(/\s+/);

        // Validate that the record has at least two components (e.g., "100 JPY").
        if (recordComponents.length < 2) {
            console.warn(`Parsing Warning: Malformed transaction record on line ${currentTransactionIdx + 2}: "${currentTransactionLine}". Skipping.`);
            continue;
        }

        // Parse the numeric value of the transaction. `parseFloat` is used to handle potential
        // decimal amounts accurately.
        const transactionValueNumeric = parseFloat(recordComponents[0]);

        // Validate the parsed numeric value.
        if (isNaN(transactionValueNumeric)) {
            console.warn(`Parsing Warning: Invalid numeric value "${recordComponents[0]}" on line ${currentTransactionIdx + 2}. Skipping.`);
            continue;
        }

        // Extract the currency identifier, ensuring it's trimmed of any incidental whitespace.
        const currencyIdentifier = recordComponents[1].trim();

        let valueToAddToTotal = 0.0; // Temporary variable to hold the calculated value for the current record.

        // Apply conditional logic based on the currency type.
        // If it's Bitcoin, convert it to the fiat equivalent using the predefined rate.
        if (currencyIdentifier === 'BTC') {
            valueToAddToTotal = transactionValueNumeric * BITCOIN_FIAT_CONVERSION_RATE;
        } else {
            // For any other currency, assume it's already in the base fiat unit.
            valueToAddToTotal = transactionValueNumeric;
        }

        // Accumulate the calculated value for the current transaction into the running total.
        aggregatedFinalSum += valueToAddToTotal;
    }

    // Display the final aggregated sum. Using `toFixed` to format the output to a consistent
    // number of decimal places, which can be useful for financial reporting.
    // `console.info` is used for general informational output.
    console.info(aggregatedFinalSum.toFixed(5));
}

// This block serves as the application's entry point, responsible for reading input
// and invoking the main processing function.
try {
    // Read the entire input content from standard input (`/dev/stdin`) using Node.js's `fs` module.
    // The content is expected to be UTF-8 encoded.
    const rawInputDataSource = require("fs").readFileSync("/dev/stdin", "utf8");

    // Execute the core financial data processing function with the obtained input.
    ProcessFinancialTransactions(rawInputDataSource);
} catch (runtimeError) {
    // Implement robust error handling for issues encountered during file reading or initial setup.
    console.error("Runtime Exception: An unexpected error occurred during program execution.", runtimeError.message);
    // In a production environment, more detailed error logging (e.g., stack trace) would be beneficial.
}