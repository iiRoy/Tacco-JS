"use strict";

// --- Input Processing Utilities ---

// Reads the entire standard input asynchronously as a UTF-8 string.
const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the input into tokens by whitespace (spaces or newlines)
// and initializes an index to keep track of the current token.
const inputTokens = rawInputBuffer.split(/ |\n/).filter(Boolean); // Filter out empty strings from split
let currentTokenIndex = 0;

/**
 * Retrieves the next token from the input stream and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function getNextIntToken() {
    // The unary plus operator (+) is a concise way to convert a string to a number.
    return +inputTokens[currentTokenIndex++];
}

/**
 * Reads a specified number of tokens from the input stream and converts them to numbers.
 * @param {number} count - The number of tokens to read.
 * @returns {number[]} An array of parsed numeric values.
 */
function getNumericArrayTokens(count) {
    if (count <= 0) {
        return []; // Handle invalid count gracefully
    }
    const startIndex = currentTokenIndex;
    currentTokenIndex += count;
    // Map each token to its numeric representation.
    return inputTokens.slice(startIndex, currentTokenIndex).map(Number);
}

// --- Global State Variables ---
let totalAccumulatedSatisfaction = 0; // Tracks the overall satisfaction score.

// --- Main Optimization Logic ---

/**
 * Implements the core optimization algorithm to determine daily item selections.
 * This function processes daily satisfaction values and item costs to maximize
 * total satisfaction over a period, considering penalties for unselected items.
 * @returns {string} A newline-separated string of selected item indices for each day.
 */
function executeOptimization() {
    // Read the total number of days for the optimization period.
    const totalDays = getNextIntToken();

    // The problem specifies a fixed number of item categories.
    const numItemCategories = 26;

    // Read the base cost (penalty decrement) for each item category.
    // This value is subtracted from the penalty tracker if an item is not chosen.
    const categoryPenaltyDecrements = getNumericArrayTokens(numItemCategories);

    // Initialize an array to track the accumulated penalty for each item category.
    // A value of 0 means no penalty has accumulated since its last selection.
    // As items are not selected, their penalty tracker values become more negative.
    const penaltyTrackers = new Array(numItemCategories).fill(0);

    // This array will store the 1-based index of the chosen item for each day.
    const dailyChoiceLog = [];

    // Iterate through each day of the optimization period.
    for (let dayCounter = 0; dayCounter < totalDays; dayCounter++) {
        // Read the satisfaction values offered by each item category for the current day.
        const currentDaySatisfactions = getNumericArrayTokens(numItemCategories);

        let highestNetGain = -Infinity; // Tracks the maximum potential gain found for the current day.
        let bestCategoryIndex = -1;     // Stores the index of the item category that yields the highest net gain.

        // Iterate through each item category to evaluate its selection potential.
        for (let categoryIdx = 0; categoryIdx < numItemCategories; categoryIdx++) {
            // Step 1: Update the penalty tracker for the current item category.
            // If this item is *not* chosen, its penalty will decrease by its base cost.
            // This means its penalty becomes more negative, reflecting a higher "cost" of not choosing it.
            penaltyTrackers[categoryIdx] -= categoryPenaltyDecrements[categoryIdx];

            // Step 2: Calculate the potential net gain if this item category were selected today.
            // This includes:
            // - `currentDaySatisfactions[categoryIdx]`: The direct satisfaction for choosing this item today.
            // - `-penaltyTrackers[categoryIdx]`: The *positive* value of the accumulated penalty that would be *removed* by selecting this item.
            // - `categoryPenaltyDecrements[categoryIdx]`: The base penalty that would *not* be incurred today because the item was selected.
            //   (This effectively cancels out the `penaltyTrackers[categoryIdx] -= categoryPenaltyDecrements[categoryIdx]` operation for this specific item if chosen)
            const potentialNetGainIfSelected =
                currentDaySatisfactions[categoryIdx] -
                penaltyTrackers[categoryIdx] +
                categoryPenaltyDecrements[categoryIdx];

            // Step 3: Compare with the current highest net gain and update if a better option is found.
            if (potentialNetGainIfSelected > highestNetGain) {
                highestNetGain = potentialNetGainIfSelected;
                bestCategoryIndex = categoryIdx;
            }
        }

        // --- Post-Selection Updates for the Day ---

        // Record the selected item's 1-based index for the current day.
        // Add 1 because problem statements often expect 1-based indexing.
        dailyChoiceLog.push(bestCategoryIndex + 1);

        // Reset the penalty tracker for the chosen item category to 0,
        // as it has just been selected, clearing any accumulated penalties.
        penaltyTrackers[bestCategoryIndex] = 0;

        // Add the direct satisfaction from the chosen item to the total.
        totalAccumulatedSatisfaction += currentDaySatisfactions[bestCategoryIndex];

        // Accumulate penalties for all unchosen items (and 0 for the chosen one).
        // The `penaltyTrackers` array contains negative values for unchosen items.
        // Summing these negative values effectively subtracts them from the total satisfaction.
        totalAccumulatedSatisfaction += penaltyTrackers.reduce((sum, val) => sum + val, 0);
    }

    // Join the daily selections with newline characters for output.
    return dailyChoiceLog.join('\n');
}

// --- Program Execution ---

// Execute the main optimization logic and capture its output.
const programOutput = executeOptimization();

// If the function returns a non-null/non-undefined value, print it to the console.
if (programOutput !== undefined && programOutput !== null) {
    console.log(String(programOutput));
}

// The `totalAccumulatedSatisfaction` variable holds the final score,
// but the problem only asks for the daily selections.
// console.log(totalAccumulatedSatisfaction); // Kept for debugging/informational purposes if needed.