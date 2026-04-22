const fileSystemModule = require('fs'); // Obtain the Node.js file system module for file operations.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Read all content from standard input as a UTF-8 string.

const inputRows = rawInputContent
    .trim() // Remove any leading or trailing whitespace from the entire input.
    .split('\n'); // Split the input string into an array of individual lines based on newline characters.


/**
 * Identifies the largest numerical element within a given collection that does not exceed
 * a specified upper boundary.
 *
 * @param {number} upperBound - The maximum permissible value for the returned number.
 * @param {Array<number>} valueCollection - An array of numerical data to be searched.
 * @returns {number} The greatest number from `valueCollection` that is less than or equal to `upperBound`,
 *                   or 0 if no such number is found (e.g., if all numbers exceed `upperBound`).
 */
const findLargestValue = (upperBound, valueCollection) => {
    return valueCollection.reduce((accumulator, currentElement) => {
        // If the current element being processed is numerically greater than the accumulated maximum...
        if (currentElement > accumulator) {
            // ...and it also adheres to the defined upper boundary...
            if (currentElement <= upperBound) {
                // ...then this current element becomes the new highest valid value found so far.
                return currentElement;
            }
            // If currentElement is greater than accumulator but surpasses the upperBound,
            // we must retain the existing valid maximum (accumulator).
            return accumulator;
        }
        // If currentElement is not greater than the accumulator, the accumulator remains the highest.
        return accumulator;
    }, 0); // Initialize the accumulator to 0, serving as the default minimum return value.
};


/**
 * Calculates the highest possible sum of two distinct item costs from a provided list,
 * ensuring that this sum does not exceed a specified spending limit.
 *
 * @param {number} spendingLimit - The maximum amount of money that can be spent.
 * @param {Array<number>} itemCosts - An array of individual item prices.
 * @returns {number} The maximum sum of two unique prices that fits within the `spendingLimit`.
 */
const calculateMaxPairSum = (spendingLimit, itemCosts) => {
    const sumPairs = []; // An array to store all possible sums of two unique prices.

    // Outer loop to iterate through each item, considering it as the first part of a pair.
    for (let outerIndex = 0; outerIndex < itemCosts.length; outerIndex++) {
        const firstCost = itemCosts[outerIndex]; // Retrieve the price of the item at the outer index.

        // Inner loop to iterate through each item again, considering it as the second part of a pair.
        for (let innerIndex = 0; innerIndex < itemCosts.length; innerIndex++) {
            // Ensure that the two selected items are not the same item (i.e., they must have distinct indices).
            if (outerIndex !== innerIndex) {
                const secondCost = itemCosts[innerIndex]; // Retrieve the price of the item at the inner index.
                sumPairs.push(firstCost + secondCost); // Add their combined sum to our collection of pairs.
            }
        }
    }

    // After generating all possible two-item sums, find the largest one that adheres to the spending limit.
    return findLargestValue(spendingLimit, sumPairs);
};


let processingCounter = 0; // A counter to keep track of the current line number being processed (0-indexed).

const processedRecords = []; // An array to store the fully parsed data sets, each containing a budget and item list.

const currentRecordTemporary = {}; // A temporary object utilized to build a single record before it's added to `processedRecords`.

let currentInputLine; // Declare the variable to hold the current line being processed outside the loop.

// Loop through each line extracted from the input data until no more lines remain to be processed.
while (currentInputLine = inputRows.shift()) {
    // Input lines are processed in alternating pairs: even-indexed lines define the budget, odd-indexed lines define the price list.
    if (processingCounter % 2 === 0) {
        // For even-indexed lines, extract and parse the spending limit.
        const spendingLimit = parseInt(currentInputLine.split(' ')[1], 10); // Split the line, take the second part, and convert it to an integer.
        currentRecordTemporary.spendingLimit = spendingLimit; // Store the parsed budget in the temporary record object.
    } else {
        // For odd-indexed lines, extract and parse the list of item costs.
        const itemCosts = currentInputLine.split(' ').map(value => parseInt(value, 10)); // Split the line and convert all parts to integers.
        currentRecordTemporary.itemCosts = itemCosts; // Store the parsed price list in the temporary record object.
        // Once both the budget and price list for a single record are collected,
        // push a copy of the temporary object to the main array of processed records.
        processedRecords.push({ ...currentRecordTemporary });
    }
    processingCounter++; // Increment the counter to prepare for the next input line.
}

/**
 * A utility function designed to display any given value to the standard output.
 * This encapsulates the standard `console.log` functionality for consistent output handling.
 * @param {*} value - The data or message to be logged to the console.
 */
const displayOutput = (value) => {
    console.log(value);
};

// Iterate over each complete record that has been parsed and stored in `processedRecords`.
processedRecords.forEach(recordItem => {
    // Destructure the record object to easily access its `spendingLimit` and `itemCosts` properties.
    const { spendingLimit, itemCosts } = recordItem;

    // Execute the main calculation logic to determine the maximum pair sum for the current record.
    const finalCalculatedSum = calculateMaxPairSum(spendingLimit, itemCosts);

    // Output the computed result for this specific record.
    displayOutput(finalCalculatedSum);
});