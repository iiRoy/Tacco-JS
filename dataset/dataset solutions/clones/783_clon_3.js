const fileOperations = require('fs');
const STANDARD_INPUT_FILE = '/dev/stdin';

// Retrieve all raw input data from the standard input file.
let unformattedInputContent = fileOperations.readFileSync(STANDARD_INPUT_FILE, 'utf8');

// Prepare the input by removing leading/trailing whitespace and splitting into an array of individual lines.
let processedInputLines = unformattedInputContent.trim().split('\n');

// An array to store the lines of the final output before joining them.
let finalOutputSegments = [];

// Define the available Japanese yen denominations.
// `VALUE_DENOMINATIONS_DESC` is used for the greedy change algorithm (descending order).
// `VALUE_DENOMINATIONS_ASC` is used for consistent indexing when processing coin counts (ascending order).
const VALUE_DENOMINATIONS_DESC = [500, 100, 50, 10];
const VALUE_DENOMINATIONS_ASC = [10, 50, 100, 500];

/**
 * Calculates the total monetary value of a collection of coins.
 * @param {number[]} counts - An array representing the count of each coin denomination (e.g., [count_10yen, count_50yen, ...]).
 * @param {number[]} denominations - An array representing the value of each coin denomination, corresponding to the counts array.
 * @returns {number} The total monetary value.
 */
const calculateMonetaryTotal = (counts, denominations) => {
    let aggregateValue = 0;
    // Basic validation to ensure array lengths match.
    if (counts.length !== denominations.length) {
        console.error("Error: Mismatch in coin counts and denomination array lengths during total calculation.");
        return 0; // Return zero or throw an error for invalid input.
    }
    for (let idx = 0; idx < counts.length; idx++) {
        aggregateValue += counts[idx] * denominations[idx];
    }
    return aggregateValue;
};

// Index to track the current line being processed from the input.
let currentInputLinePointer = 0;

// Main loop to process each transaction block until a termination condition is met.
while (currentInputLinePointer < processedInputLines.length) {
    // Read the purchase price for the current transaction.
    const transactionPriceString = processedInputLines[currentInputLinePointer++];
    
    // If the line is empty or undefined, it indicates the end of valid input or an error.
    if (!transactionPriceString) {
        break;
    }
    
    // Convert the price string to an integer, specifying radix 10 for clarity.
    const transactionPurchasePrice = parseInt(transactionPriceString, 10);

    // A purchase price of 0 signals the end of all transactions.
    if (transactionPurchasePrice === 0) {
        break;
    }

    // Read the line containing the counts of coins provided by the customer.
    const customerCoinsString = processedInputLines[currentInputLinePointer++];
    
    // Guard against missing coin count data for a transaction.
    if (!customerCoinsString) {
        console.error(`Error: Missing coin count line for a transaction starting with price ${transactionPurchasePrice}.`);
        // Optionally, add an error message to output or skip this transaction.
        finalOutputSegments.push(`Error processing transaction for ${transactionPurchasePrice}.`);
        continue;
    }
    
    // Parse the customer's coin counts into an array of numbers.
    const customerProvidedCoinCounts = customerCoinsString.split(' ').map(countStr => parseInt(countStr, 10));

    // Perform a basic validation on the number of coin counts provided.
    // This is an additional Type III check for input integrity.
    if (customerProvidedCoinCounts.length !== VALUE_DENOMINATIONS_ASC.length) {
        finalOutputSegments.push(`Warning: Incorrect number of coin counts provided for transaction price ${transactionPurchasePrice}. Skipping.`);
        continue; // Skip this transaction if format is unexpected.
    }

    // Calculate the total monetary value of the coins the customer paid with.
    const totalPaymentReceived = calculateMonetaryTotal(customerProvidedCoinCounts, VALUE_DENOMINATIONS_ASC);

    // Determine the exact amount of change that needs to be given back.
    let changeAmountRemaining = totalPaymentReceived - transactionPurchasePrice;

    // Initialize an array to store the breakdown of coins to be returned as change.
    // The indices correspond to `VALUE_DENOMINATIONS_ASC` (e.g., [count_10yen, count_50yen, ...]).
    let changeCoinsToIssue = Array(VALUE_DENOMINATIONS_ASC.length).fill(0);

    // Apply a greedy algorithm to determine the minimum number of coins for the change.
    // Iterate through denominations from largest to smallest.
    for (const currentDenominationValue of VALUE_DENOMINATIONS_DESC) {
        // Calculate how many coins of the current denomination can be used for change.
        const numberOfCurrentDenomination = Math.floor(changeAmountRemaining / currentDenominationValue);
        
        // If one or more coins of this denomination can be returned.
        if (numberOfCurrentDenomination > 0) {
            // Find the correct index in the ascending denominations array to update `changeCoinsToIssue`.
            const correspondingAscIndex = VALUE_DENOMINATIONS_ASC.indexOf(currentDenominationValue);
            if (correspondingAscIndex !== -1) {
                 changeCoinsToIssue[correspondingAscIndex] += numberOfCurrentDenomination;
            }
            // Subtract the value of returned coins from the remaining change amount.
            changeAmountRemaining -= numberOfCurrentDenomination * currentDenominationValue;
        }
    }

    // Now, determine which specific coins (from the customer's payment) are returned.
    // This involves comparing what the customer gave vs. what is needed for change.
    for (let k = 0; k < VALUE_DENOMINATIONS_ASC.length; k++) {
        const denominationValue = VALUE_DENOMINATIONS_ASC[k];
        const customerInitialCount = customerProvidedCoinCounts[k];
        const requiredChangeCount = changeCoinsToIssue[k];

        // If the customer provided more of a certain coin than what is required for optimal change,
        // the excess of that specific coin is returned directly to the customer.
        if (customerInitialCount > requiredChangeCount) {
            const coinsExcessToReturn = customerInitialCount - requiredChangeCount;
            finalOutputSegments.push(`${denominationValue} ${coinsExcessToReturn}`);
        }
    }

    // Add an empty string to the output segments to create a blank line between transaction results.
    finalOutputSegments.push('');
}

// Join all collected output segments with newline characters and trim any trailing newline
// that might result from the last empty string push.
console.log(finalOutputSegments.join('\n').trim());