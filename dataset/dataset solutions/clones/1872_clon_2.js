"use strict";

/**
 * This function processes a set of numerical inputs to compute a final aggregate value.
 * It simulates a scenario where different types of items contribute positively, neutrally,
 * or negatively to a score, up to a certain operation threshold.
 * @param {string} inputDataString The raw string received from input, expected to contain
 *                                 four space-separated integers on the first line.
 */
function processNumericalScenario(inputDataString) {
    // Extract numerical parameters from the provided input string.
    // The input is first cleaned, then split by newline to get the first line,
    // that line is then split by spaces, and finally, all parts are converted to numbers.
    let [ itemTypeOneQuantity, itemTypeTwoQuantity, itemTypeThreeQuantity, maxOperationsAllowed ] = inputDataString
        .trim()
        .split('\n')[0]
        .split(' ')
        .map(Number);

    let runningTotal = 0; // Initialize the score accumulator.

    // --- Step 1: Prioritize processing items that yield a positive contribution (+1). ---
    // Determine how many positive items can be used within the remaining operations.
    if (itemTypeOneQuantity >= maxOperationsAllowed) {
        runningTotal = maxOperationsAllowed; // All allowed operations can be covered by positive items.
        maxOperationsAllowed = 0; // No more operations remain to be performed.
    } else {
        runningTotal = itemTypeOneQuantity; // Use all available positive items.
        maxOperationsAllowed = maxOperationsAllowed - itemTypeOneQuantity; // Reduce the operation count.
    }

    // --- Step 2: Subsequently process items that yield a neutral contribution (0). ---
    // If operations still remain, use neutral items. These consume operations but do not
    // alter the running total.
    if (itemTypeTwoQuantity >= maxOperationsAllowed) {
        maxOperationsAllowed = 0; // All remaining operations are consumed by neutral items.
    } else {
        maxOperationsAllowed = maxOperationsAllowed - itemTypeTwoQuantity; // Reduce operation count by available neutral items.
    }

    // --- Step 3: Finally, process items that yield a negative contribution (-1). ---
    // If operations are still available after exhausting positive and neutral items,
    // use negative items. These will decrease the running total.
    if (itemTypeThreeQuantity >= maxOperationsAllowed) {
        runningTotal = runningTotal - maxOperationsAllowed; // Subtract for the remaining operations.
        // At this point, maxOperationsAllowed effectively becomes zero.
    } else {
        runningTotal -= itemTypeThreeQuantity; // Subtract for all available negative items.
        // No further item types, so maxOperationsAllowed's final value is not used.
    }

    // Display the computed final score to the console output.
    console.log(runningTotal);
}

// Invoke the primary processing function with data obtained from standard input.
processNumericalScenario(require('fs').readFileSync('/dev/stdin', 'utf8'));