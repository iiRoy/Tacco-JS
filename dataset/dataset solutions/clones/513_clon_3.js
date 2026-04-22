// This script processes multiple datasets from standard input to calculate
// a maximized product based on a set of primary values and supplementary weights.
// It simulates a scenario where items are consumed, and their value is enhanced
// by additional factors, aiming to find the highest possible cumulative product.

// Core Node.js module for file system operations.
const fileSystemAccess = require('node:fs');

// --- Input Data Acquisition and Pre-processing ---
// Read the entire content from the standard input synchronously.
// Using an options object for readFileSync for clarity and robustness.
const rawInputStreamContent = fileSystemAccess.readFileSync('/dev/stdin', { encoding: 'utf8' });

// Split the raw content into individual lines.
// Handle both Windows (\r\n) and Unix (\n) line endings using a regex.
// Each line is then trimmed to remove leading/trailing whitespace.
// Finally, filter out any lines that become empty after trimming, ensuring valid data lines.
let dataLinesBuffer = rawInputStreamContent
    .split(/\r?\n/)
    .map(lineContent => lineContent.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

// --- Main Processing Loop for Multiple Test Cases ---
let datasetCounter = 0; // Helper variable to track the number of processed datasets.
// The loop continues indefinitely until an explicit break condition is met,
// allowing for an unknown number of test cases.
for (;;) {
    datasetCounter++; // Increment the counter for the current dataset being processed.

    // Guard clause: Ensure there are lines available in the buffer to read the item count.
    // If the buffer is empty, it means all datasets have been processed or input was malformed.
    if (dataLinesBuffer.length === 0) {
        // console.debug(`[DEBUG] No more data lines in buffer. Terminating after ${datasetCounter - 1} datasets.`);
        break; // Exit the loop gracefully if no more data.
    }

    // Extract the line containing the item count for the current dataset.
    // `shift()` removes the first element from the array and returns it.
    const currentCountString = dataLinesBuffer.shift();

    // Basic validation: Check if the extracted string is a valid non-negative integer.
    // This regex ensures it contains only digits. If invalid, log an error and terminate.
    if (!/^\d+$/.test(currentCountString)) {
        console.error(`[ERROR] Invalid item count format encountered for dataset ${datasetCounter}: '${currentCountString}'. Terminating.`);
        break; // Exit due to malformed input.
    }

    // Convert the string representation of the count to an integer using radix 10.
    let activeItemCount = Number.parseInt(currentCountString, 10);

    // Termination condition: A count of 0 signifies the explicit end of input datasets.
    if (activeItemCount === 0) {
        // console.debug(`[DEBUG] Received termination signal (count is 0) for dataset ${datasetCounter}.`);
        break; // Exit the main processing loop as per problem specification.
    }

    // --- Processing Primary Values ---
    // Guard clause: Ensure there's a line available for the primary values.
    if (dataLinesBuffer.length === 0) {
        console.error(`[ERROR] Missing primary values line for dataset ${datasetCounter}. Terminating.`);
        break; // Exit if input is incomplete.
    }
    const primaryValuesInputLine = dataLinesBuffer.shift();

    // Parse primary values from the line.
    // Each string element is converted to an integer using Number.parseInt.
    // Any resulting NaN values (from non-numeric strings) are filtered out, ensuring clean data.
    const baseValueCollection = primaryValuesInputLine
        .split(' ')
        .map(valStr => Number.parseInt(valStr, 10))
        .filter(parsedVal => !Number.isNaN(parsedVal));

    // --- Processing Supplementary Weights ---
    // Guard clause: Ensure there's a line available for the supplementary weights.
    if (dataLinesBuffer.length === 0) {
        console.error(`[ERROR] Missing supplementary weights line for dataset ${datasetCounter}. Terminating.`);
        break; // Exit if input is incomplete.
    }
    const supplementaryWeightsInputLine = dataLinesBuffer.shift();

    // Parse supplementary weights from the line, similar to primary values.
    let bonusFactorCollection = supplementaryWeightsInputLine
        .split(' ')
        .map(valStr => Number.parseInt(valStr, 10))
        .filter(parsedVal => !Number.isNaN(parsedVal));

    // --- Initial Calculations ---
    // Calculate the initial aggregate sum of all base values.
    // Using an explicit for...of loop instead of `reduce` for structural variation
    // and potentially clearer step-by-step accumulation.
    let initialBaseSumAggregate = 0;
    for (const val of baseValueCollection) {
        initialBaseSumAggregate += val;
    }

    // Sort the bonus factors in descending order. This is a critical step
    // to ensure that the largest factors are considered first, which is necessary
    // for maximizing the final product in each iteration.
    bonusFactorCollection.sort((factorA, factorB) => factorB - factorA);

    // Initialize the variable to store the highest product found so far for this dataset.
    // The initial product is calculated using the total base sum and the initial item count,
    // before any bonus factors are applied.
    let highestProductAchieved = initialBaseSumAggregate * activeItemCount;

    // --- Iterative Product Maximization ---
    // This loop iteratively applies bonus factors to the sum and updates the maximum product.
    // It continues as long as there are bonus factors remaining to apply AND
    // there are still active items to count (activeItemCount > 0).
    while (bonusFactorCollection.length > 0 && activeItemCount > 0) {
        activeItemCount--; // Decrement the count of active items for the next iteration.
                           // This represents one item being "consumed" or processed.

        // Retrieve the next largest bonus factor from the collection.
        // `shift()` removes and returns the first element, which is the largest due to prior sorting.
        const currentBonusFactor = bonusFactorCollection.shift();

        // Calculate the temporary sum by adding the current bonus factor to the initial base sum.
        // This is an intermediate step to enhance readability.
        const intermediateSumWithBonus = initialBaseSumAggregate + currentBonusFactor;

        // Calculate the potential new product with the updated sum and the decremented item count.
        // This is another intermediate step for clarity.
        const potentialProductValue = intermediateSumWithBonus * activeItemCount;

        // Update the highest product if the newly calculated product is greater than
        // any product found in previous iterations.
        highestProductAchieved = Math.max(highestProductAchieved, potentialProductValue);
    }

    // --- Output Result ---
    // Print the maximum product found for the current dataset to standard output.
    // Using .toString() explicitly ensures the output is always a string,
    // though console.log typically handles numbers fine.
    console.log(highestProductAchieved.toString());
}

// End of script execution.