// This JavaScript program is designed to identify the maximum possible sum of two distinct item prices
// from a given list that remains within a specified budget limit.
// Input is expected from standard input, with the first line containing the total item count
// and the budget, and the second line containing the individual prices of the items.

// Acquire the Node.js file system module for reading input data.
const fileSystemUtility = require('fs');

/**
 * A helper function to parse a string of space-separated numbers into an array of numeric values.
 * It handles potential multiple spaces between numbers and trims leading/trailing whitespace.
 * @param {string} textLine The string containing numbers to be parsed.
 * @returns {number[]} An array of numbers.
 */
const extractNumericValues = (textLine) => {
    // Trim any leading/trailing whitespace from the line, then split it by one or more spaces.
    // Finally, convert each resulting string segment into a number.
    return textLine.trim().split(/\s+/).map(Number);
};

// --- Input Acquisition and Initial Validation ---

// Read all incoming data from standard input (usually '/dev/stdin' on Unix-like systems)
// and interpret it as a UTF-8 encoded string.
const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace, then split it into an array
// of individual lines. Filter out any empty lines that might result from extra newlines.
const processedInputRows = rawInputContent.trim().split('\n').filter(Boolean);

// Crucial validation: Ensure that we have received at least two lines of input data.
// The first line for counts/budget, the second for item prices.
if (processedInputRows.length < 2) {
    console.error("System Error: Insufficient input data. Expected at least two lines.");
    process.exit(1); // Terminate the process with an error code.
}

// Parse the first line to obtain the total number of items and the spending constraint.
// Using array destructuring for clear variable assignment.
const [declaredItemCount, spendingConstraint] = extractNumericValues(processedInputRows[0]);

// Validate the parsed numerical values from the first line.
// Ensure they are actual numbers, non-negative, and not NaN.
if (isNaN(declaredItemCount) || isNaN(spendingConstraint) || declaredItemCount < 0 || spendingConstraint < 0) {
    console.error("System Error: Invalid values for item count or spending constraint detected.");
    process.exit(1);
}

// Parse the second line to get the array of costs for all available items.
const itemPriceList = extractNumericValues(processedInputRows[1]);

// Verify that the actual number of parsed item prices matches the declared item count.
if (itemPriceList.length !== declaredItemCount) {
    console.error(`System Error: Mismatch between declared item count (${declaredItemCount}) and the actual number of prices provided (${itemPriceList.length}).`);
    process.exit(1);
}

// Initialize a variable to keep track of the highest valid sum found so far.
// Set to 0, assuming item prices are non-negative and 0 is the lowest possible sum.
let maximumPermittedCombinationSum = 0;

// A boolean flag to indicate if any pair of items was found that satisfies the conditions.
let isAnyValidPairIdentified = false;

// --- Core Logic: Iterating and Finding the Optimal Sum ---

// Begin iterating through each item using its index as the potential 'first' item in a pair.
for (let primaryItemIdx = 0; primaryItemIdx < declaredItemCount; primaryItemIdx++) {
    // Optional: Basic validation for individual item prices.
    // While not strictly necessary for typical "price" scenarios, it adds robustness.
    if (itemPriceList[primaryItemIdx] < 0) {
        // If an item has a negative price, it might indicate bad data; skip it.
        continue;
    }

    // For the 'second' item in the pair, iterate starting from the next index after 'primaryItemIdx'.
    // This ensures that:
    // 1. We consider only distinct items (primaryItemIdx !== secondaryItemIdx).
    // 2. We avoid duplicate pairs (e.g., (itemA, itemB) is processed only once, not also as (itemB, itemA)).
    for (let secondaryItemIdx = primaryItemIdx + 1; secondaryItemIdx < declaredItemCount; secondaryItemIdx++) {
        // Optional: Validation for the second item's price.
        if (itemPriceList[secondaryItemIdx] < 0) {
            continue;
        }

        // Calculate the combined cost for the current pair of items.
        const currentItemsCombinedCost = itemPriceList[primaryItemIdx] + itemPriceList[secondaryItemIdx];

        // Check if this combined cost is within the allowed spending constraint.
        if (currentItemsCombinedCost <= spendingConstraint) {
            // If the current combination is valid and its sum is greater than
            // any previous valid sum, update our record.
            if (currentItemsCombinedCost > maximumPermittedCombinationSum) {
                maximumPermittedCombinationSum = currentItemsCombinedCost;
                isAnyValidPairIdentified = true; // Set the flag, indicating we've found at least one suitable pair.
            }
        }
    }
}

// --- Outputting the Final Result ---

// Based on whether any valid pair was successfully identified, print the appropriate output.
if (isAnyValidPairIdentified) {
    console.log(maximumPermittedCombinationSum); // Display the highest sum found that met the criteria.
} else {
    // If no combination of two distinct items could be found within the budget,
    // or if the item list was too small to form a pair, output "NONE".
    console.log("NONE");
}