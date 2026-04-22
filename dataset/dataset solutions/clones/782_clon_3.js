// --- Start of Type III Cloned Code ---

// This module is responsible for handling file system interactions, such as reading input files.
const fileSystemUtility = require('fs');

/**
 * Retrieves the raw content from a specified file path.
 * It's designed to read synchronous input for command-line utilities.
 * @param {string} sourcePath - The file path from which to read data.
 * @returns {string} The content of the file, decoded as a UTF-8 string.
 */
function acquireRawInput(sourcePath) {
    // Synchronously read the entire file content.
    return fileSystemUtility.readFileSync(sourcePath, 'utf8');
}

/**
 * Parses a string containing space-separated numeric values into an array of integers.
 * This function handles the conversion from string to number explicitly using parseInt.
 * @param {string} inputString - A string where numbers are separated by spaces.
 * @returns {number[]} An array containing the parsed integer values.
 */
function parseNumericStringArray(inputString) {
    // Split the string by spaces and convert each part to an integer with base 10.
    return inputString.split(' ').map(val => parseInt(val, 10));
}

/**
 * Presents the final accumulated output to the console.
 * This function centralizes the output mechanism for consistency.
 * @param {string[]} linesToDisplay - An array of strings, where each string represents a line of output.
 */
function presentFinalResults(linesToDisplay) {
    // Join all collected lines with newline characters and print to standard output.
    console.log(linesToDisplay.join('\n'));
}

// --- Global Constants for Currency Denominations ---
// Standard Japanese Yen denominations, ordered from smallest to largest for consistent indexing.
const YEN_DENOMINATIONS_ASCENDING = [10, 50, 100, 500];

// Mapping to quickly find the array index for a given denomination value.
const DENOMINATION_VALUE_TO_INDEX = {
    10: 0,
    50: 1,
    100: 2,
    500: 3
};

// Denominations ordered from largest to smallest, crucial for the greedy change-making algorithm.
const YEN_DENOMINATIONS_DESCENDING = [500, 100, 50, 10];

// --- Main Program Execution Flow ---

// Step 1: Read and prepare the input data.
// Acquire the raw input string from the standard input device.
const rawInputContent = acquireRawInput('/dev/stdin');

// Process the raw input: trim whitespace, split into individual lines, and filter out any empty lines.
const processedInputSegments = rawInputContent
    .trim() // Remove leading/trailing whitespace from the whole input.
    .split('\n') // Break the input into an array of strings, one for each line.
    .filter(segment => segment.length > 0); // Ensure no empty lines are processed.

// Initialize an array to accumulate all output lines. This is more efficient for many concatenations.
const transactionOutputBuffer = [];

// A counter for tracking the current transaction number, useful for debugging or detailed logging.
let currentTransactionCycle = 0;

// Step 2: Process each transaction in a loop.
// The loop continues until a specific termination condition (itemPriceInYen === 0) is met or input runs out.
while (true) {
    currentTransactionCycle++; // Increment the transaction counter for the current cycle.

    // Extract the line representing the item's purchase price.
    const purchasePriceString = processedInputSegments.shift();

    // Guard clause: If no more input lines are available, exit the processing loop.
    if (!purchasePriceString) {
        break;
    }

    // Convert the purchase price string to an integer.
    const itemPriceInYen = parseInt(purchasePriceString, 10);

    // Termination condition: If the parsed price is 0, this indicates the end of all transactions.
    if (itemPriceInYen === 0) {
        break;
    }

    // Validation: Check if the parsed item price is a valid positive number.
    if (isNaN(itemPriceInYen) || itemPriceInYen < 0) {
        transactionOutputBuffer.push(`Error in transaction ${currentTransactionCycle}: Invalid item price '${purchasePriceString}'. Skipping this transaction.`);
        transactionOutputBuffer.push(''); // Add a blank line for readability.
        continue; // Skip to the next transaction cycle.
    }

    // Extract the line containing the counts of coins provided by the customer.
    const providedCoinCountsString = processedInputSegments.shift();

    // Guard clause: If the coin counts line is missing, it's a critical input error.
    if (!providedCoinCountsString) {
        transactionOutputBuffer.push(`Critical Error: Missing coin counts for transaction ${currentTransactionCycle}. Terminating processing.`);
        break; // Exit the loop due to malformed input.
    }

    // Parse the string of coin counts into an array of numbers.
    const customerCoinSupply = parseNumericStringArray(providedCoinCountsString);

    // Validation: Ensure the correct number of coin denominations are provided.
    if (customerCoinSupply.length !== YEN_DENOMINATIONS_ASCENDING.length) {
        transactionOutputBuffer.push(`Error in transaction ${currentTransactionCycle}: Incorrect number of coin counts. Expected ${YEN_DENOMINATIONS_ASCENDING.length}, got ${customerCoinSupply.length}. Skipping.`);
        transactionOutputBuffer.push('');
        continue;
    }

    // Calculate the total monetary value of coins provided by the customer.
    let totalCustomerPaymentValue = 0;
    for (let denomIdx = 0; denomIdx < YEN_DENOMINATIONS_ASCENDING.length; denomIdx++) {
        totalCustomerPaymentValue += customerCoinSupply[denomIdx] * YEN_DENOMINATIONS_ASCENDING[denomIdx];
    }

    // Determine the exact amount of change that needs to be returned to the customer.
    let changeAmountRequired = totalCustomerPaymentValue - itemPriceInYen;

    // Guard clause: Check for insufficient payment.
    if (changeAmountRequired < 0) {
        transactionOutputBuffer.push(`Transaction ${currentTransactionCycle}: Insufficient payment. Customer paid ${totalCustomerPaymentValue} yen, but item costs ${itemPriceInYen} yen.`);
        transactionOutputBuffer.push('');
        continue;
    }

    // Initialize an array to store the breakdown of coins to be dispensed as change.
    // The indices correspond to YEN_DENOMINATIONS_ASCENDING.
    const dispensedChangeCounts = new Array(YEN_DENOMINATIONS_ASCENDING.length).fill(0);

    // Apply a greedy algorithm to calculate the optimal coin breakdown for the change.
    // Iterate through denominations from largest to smallest to ensure minimal coins.
    for (const currentDenominationValue of YEN_DENOMINATIONS_DESCENDING) {
        const targetIndex = DENOMINATION_VALUE_TO_INDEX[currentDenominationValue];
        // Dispense as many coins of the current denomination as possible.
        while (changeAmountRequired >= currentDenominationValue) {
            dispensedChangeCounts[targetIndex]++;
            changeAmountRequired -= currentDenominationValue;
        }
    }

    // Optional Check: If any change remains after the greedy algorithm, something is amiss.
    // (This shouldn't happen with standard currency denominations, but it's a robust check).
    if (changeAmountRequired > 0) {
        transactionOutputBuffer.push(`Warning in transaction ${currentTransactionCycle}: Could not dispense exact change. Remaining: ${changeAmountRequired} yen.`);
    }

    // Step 3: Determine which coins from the customer's initial supply need to be returned.
    // This involves comparing what the customer gave vs. what was used to make change.
    for (let denomIndex = 0; denomIndex < YEN_DENOMINATIONS_ASCENDING.length; denomIndex++) {
        const currentDenomination = YEN_DENOMINATIONS_ASCENDING[denomIndex];
        const initialProvidedCount = customerCoinSupply[denomIndex];
        const countRequiredForChange = dispensedChangeCounts[denomIndex];

        // If the customer initially provided more coins of this type than were needed for change,
        // the excess coins of this specific denomination are returned to them.
        if (initialProvidedCount > countRequiredForChange) {
            const excessCoinsToReturn = initialProvidedCount - countRequiredForChange;
            transactionOutputBuffer.push(`${currentDenomination} ${excessCoinsToReturn}`);
        }
    }

    // Add an empty line to the buffer to clearly separate the output of each transaction.
    transactionOutputBuffer.push('');
}

// Step 4: Display all collected results at once.
presentFinalResults(transactionOutputBuffer);

// --- End of Type III Cloned Code ---