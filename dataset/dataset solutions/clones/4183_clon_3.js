// Helper utility for safe integer parsing, gracefully handling non-numeric inputs.
const obtainNumericValue = (textualData, fallback = 0) => {
    const parsedValue = parseInt(textualData, 10);
    // Return the parsed number if valid, otherwise the specified fallback value.
    return isNaN(parsedValue) ? fallback : parsedValue;
};

// --- Initial Data Acquisition and Pre-processing ---

// Retrieve all lines from standard input, decoding as UTF-8, and split into an array.
let incomingLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Implement an early exit condition for malformed or insufficient input.
if (incomingLines.length < 2) {
    console.log(0); // If input is too short, no operations can be performed, resulting in zero cost.
    return;
}

// Extract and process the first line which contains configuration parameters.
// Trim whitespace and split into individual string components.
const configurationParameters = incomingLines.shift().trim().split(' ');

// Parse the total number of items expected (N in original context).
const expectedItemCount = obtainNumericValue(configurationParameters[0]);
// Parse the desired number of unique items after reduction (K in original context).
const desiredUniqueItemCount = obtainNumericValue(configurationParameters[1]);

// Extract and process the second line containing the actual data elements.
// Filter out any empty strings that might result from multiple spaces between elements.
const rawItemStrings = incomingLines.shift().trim().split(' ').filter(str => str !== '');

// Convert the raw item strings into an array of numeric values.
const numericDataItems = rawItemStrings.map(itemStr => obtainNumericValue(itemStr));

// --- Frequency Analysis Phase ---

// Utilize a Map structure to efficiently store and retrieve the frequency of each unique item.
// Map is chosen for its robust handling of various key types, including numeric strings.
const itemOccurrenceMap = new Map();

// Iterate through the processed numeric data items up to the expected count.
// This loop ensures we process exactly 'expectedItemCount' items, mirroring original logic's 'N'.
for (let currentItemIndex = 0; currentItemIndex < expectedItemCount; ++currentItemIndex) {
    const currentDataItem = numericDataItems[currentItemIndex];

    // Add a guard clause: only process valid numeric items.
    // This prevents errors if 'numericDataItems' is shorter than 'expectedItemCount' or contains NaNs.
    if (typeof currentDataItem !== 'number' || isNaN(currentDataItem)) {
        continue; // Skip invalid entries.
    }

    // Increment the count for the current data item in the map.
    // If the item hasn't been seen before, initialize its count to 0.
    const existingCount = itemOccurrenceMap.get(currentDataItem) || 0;
    itemOccurrenceMap.set(currentDataItem, existingCount + 1);
}

// --- Cost Calculation for Item Elimination ---

// Extract all frequency counts into a standard array for sorting.
const allFrequencyValues = Array.from(itemOccurrenceMap.values());

// Determine the current total number of distinct items.
const actualDistinctItemCount = allFrequencyValues.length;

// Calculate how many distinct items need to be removed to meet the desired unique item count.
const itemsToEliminateCount = actualDistinctItemCount - desiredUniqueItemCount;

let totalEliminationCost = 0; // Accumulator for the minimum cost.

// Proceed only if there are distinct items that need to be removed.
if (itemsToEliminateCount > 0) {
    // Sort the frequencies in ascending order.
    // This strategy ensures we remove the least frequent items first to minimize cost.
    allFrequencyValues.sort((freqA, freqB) => freqA - freqB);

    // Initialize a counter for the remaining items that still need to be eliminated.
    let remainingEliminations = itemsToEliminateCount;

    // Iterate through the sorted frequencies, summing the smallest ones.
    // This loop effectively calculates the cost of removing the 'itemsToEliminateCount' least frequent distinct items.
    for (let freqIterator = 0; freqIterator < allFrequencyValues.length; ++freqIterator) {
        // If we have already accounted for enough eliminations, terminate the loop.
        if (remainingEliminations <= 0) {
            break;
        }

        // Add the current smallest frequency to the running total cost.
        totalEliminationCost += allFrequencyValues[freqIterator];
        remainingEliminations--; // Decrement the count of items left to eliminate.
    }

    // Output the final calculated minimum cost.
    console.log(totalEliminationCost);
} else {
    // If the number of distinct items is already at or below the desired count, no cost is incurred.
    console.log(0);
}