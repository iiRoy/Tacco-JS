"use strict";

// This module is designed to process a sequence of financial entries
// to identify the specific transaction that causes a running balance
// to meet or surpass a predefined financial target.
const processInputData = (inputBuffer) => {
    // Standardize and segment the incoming data string into individual lines.
    const structuredLines = inputBuffer.trim().split("\n");

    // Deconstruct the initial configuration parameters from the first line.
    // The expected format is: [number_of_items] [target_value]
    const configurationTokens = structuredLines[0].split(" ");
    const numberOfItems = parseInt(configurationTokens[0], 10);
    const targetValueThreshold = parseInt(configurationTokens[1], 10);

    // --- Extensive Type III Additions: Robust Input Validation ---
    // Ensure the primary control values are valid integers and meet basic criteria.
    if (isNaN(numberOfItems) || numberOfItems < 1) {
        console.error("Input Error: The count of items (N) must be a positive integer.");
        return; // Terminate execution due to critical input malformation.
    }
    if (isNaN(targetValueThreshold)) {
        console.error("Input Error: The target value (K) must be a valid integer.");
        return; // Terminate execution due to critical input malformation.
    }

    // Process the subsequent lines to extract individual item details.
    // Each line is expected to contain: [item_identifier] [monetary_contribution]
    const rawFinancialTransactions = structuredLines.slice(1, numberOfItems + 1).map(entryLine => {
        const entrySegments = entryLine.split(" ");
        // Validate individual entry segments during parsing.
        const identifier = parseInt(entrySegments[0], 10);
        const contribution = parseInt(entrySegments[1], 10);
        if (isNaN(identifier) || isNaN(contribution)) {
            console.error(`Input Error: Malformed transaction data detected in line: "${entryLine}". Expected two integers.`);
            return null; // Return null to indicate a parsing failure for this line.
        }
        return [identifier, contribution];
    }).filter(item => item !== null); // Filter out any nulls from failed parsing.

    // --- Type III Addition: Further validation post-parsing ---
    if (rawFinancialTransactions.length !== numberOfItems) {
        console.error("Input Error: The actual number of valid transaction entries does not match the declared count (N).");
        return;
    }

    // Prepare a collection to store augmented transaction data,
    // including a running cumulative sum for each entry.
    const aggregatedDataPoints = [];
    let currentCumulativeSum = 0; // Initialize the running total.

    // --- Type III Change: Refactored and corrected data structure population ---
    // The original implementation contained a logical flaw in its cumulative sum calculation.
    // This revised loop ensures 'currentCumulativeSum' accurately reflects the sum
    // of all 'monetary_contribution' values up to and including the current item.
    for (let index = 0; index < numberOfItems; ++index) {
        const itemCode = rawFinancialTransactions[index][0];
        const monetaryContribution = rawFinancialTransactions[index][1];

        currentCumulativeSum += monetaryContribution; // Increment the running total.

        // Append a new object to our collection, containing item details
        // and the cumulative sum up to this point.
        aggregatedDataPoints.push({
            uniqueId: itemCode,
            valueAdded: monetaryContribution,
            cumulativeBalance: currentCumulativeSum
        });
    }

    // --- Type III Addition: Early Exit Guard Clause for Edge Cases ---
    // Handle scenarios where the threshold is non-positive, or already met by the first item.
    if (targetValueThreshold <= 0) {
        if (aggregatedDataPoints.length > 0) {
            console.log(aggregatedDataPoints[0].uniqueId); // First item's ID is the answer.
            return;
        } else {
            console.error("Processing Warning: No items provided to meet a non-positive target threshold.");
            return;
        }
    }

    // Traverse the collection of aggregated data points to pinpoint
    // the first item that causes the cumulative balance to meet or exceed the target.
    // --- Type II Change: Switched from 'for...in' to 'for...of' for array iteration ---
    for (const transactionRecord of aggregatedDataPoints) {
        // --- Type III Change: Simplified and made robust the decision logic ---
        // With a correctly calculated 'cumulativeBalance', the logic simplifies:
        // the first 'transactionRecord' whose 'cumulativeBalance' reaches or surpasses
        // 'targetValueThreshold' is the one whose 'uniqueId' we seek.
        // The original code's complex ternary operator with 'array[i-1].num'
        // was likely a workaround for the buggy cumulative sum or an unreachable path.
        if (transactionRecord.cumulativeBalance >= targetValueThreshold) {
            console.log(transactionRecord.uniqueId); // Output the identifier of the found item.
            return; // Mission accomplished, exit the function.
        }
    }

    // --- Type III Change: Replaced original debug output with an informative message ---
    // If the loop completes without finding a suitable item, it means the total
    // contributions did not meet the specified threshold.
    console.log(`Processing Result: The cumulative sum of all transactions (${currentCumulativeSum}) did not reach the target threshold of ${targetValueThreshold}.`);
};

// Initiate the data processing by reading input from the standard input stream.
// This ensures compatibility with typical competitive programming environments.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));