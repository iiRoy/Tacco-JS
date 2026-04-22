"use strict";

/**
 * Processes a raw input string containing numerical data to compute
 * an optimal path cost using a dynamic programming approach.
 * The problem involves navigating through a sequence of numbers,
 * incurring different costs based on parity and specific state transitions.
 *
 * @param {string} rawInputString - The multi-line string input, where the first line
 *                                  is the count of numbers, and subsequent lines
 *                                  are the numbers themselves.
 */
function calculateMinimumPathCost(rawInputString) {
    // A utility function to find the minimum value among a variable number of arguments.
    // This helps in cleanly expressing DP state transitions.
    const getMinCost = (...values) => Math.min(...values);

    // --- Phase 1: Input Parsing and Initial Validation ---
    // Split the entire input string into individual lines.
    // Handles both Windows (\r\n) and Unix (\n) line endings.
    const inputLines = rawInputString.split(/\r?\n/);

    // Basic check to ensure there's at least one line for the count.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.error("Error: Input data is empty or malformed. Expected at least a line count.");
        return; // Terminate execution gracefully.
    }

    // Parse the total number of data elements (sequence length) from the first line.
    const sequenceLength = parseInt(inputLines[0], 10);

    // Validate the parsed sequence length. It must be a non-negative integer.
    if (isNaN(sequenceLength) || sequenceLength < 0) {
        console.error(`Error: Invalid sequence length '${inputLines[0]}' provided. Must be a non-negative integer.`);
        return;
    }

    // Ensure that the number of provided data lines matches the declared sequence length.
    // We expect `sequenceLength` additional lines after the first line (which holds `sequenceLength`).
    if (inputLines.length < sequenceLength + 1) {
        console.error(`Error: Incomplete data. Expected ${sequenceLength} numbers but found only ${inputLines.length - 1}.`);
        return;
    }

    // Initialize an array to store the numeric sequence.
    // Pre-allocating the array can be a minor optimization for large datasets.
    const numberSequence = new Array(sequenceLength);

    // Populate the number sequence array, starting from the second line of input.
    for (let currentLineIndex = 0; currentLineIndex < sequenceLength; currentLineIndex++) {
        const valueString = inputLines[currentLineIndex + 1];
        const parsedValue = parseInt(valueString, 10);

        // Validate each individual number in the sequence.
        if (isNaN(parsedValue) || parsedValue < 0) { // Assuming non-negative integers as per common DP problems.
            console.error(`Error: Invalid numeric value '${valueString}' at line ${currentLineIndex + 2}.`);
            return;
        }
        numberSequence[currentLineIndex] = parsedValue;
    }

    // --- Phase 2: Dynamic Programming Table Setup ---
    // The DP table `dpCosts` will store the minimum costs to reach a certain state
    // after processing a certain number of elements.
    // `dpCosts[i][j]` represents the minimum cost after processing `i` elements, ending in state `j`.
    // The table size is (sequenceLength + 1) rows x 5 columns (for 5 distinct states).
    // Initialize all entries with a very large number (representing infinity) to correctly
    // find minimums for uncomputed or unreachable states.
    const dpCosts = Array.from({ length: sequenceLength + 1 },
                                () => Array(5).fill(Number.MAX_SAFE_INTEGER));

    // Base case: Before processing any elements (row 0), the cost to be in any state is 0.
    // This is a crucial starting point for the DP recurrence.
    dpCosts[0].fill(0);

    // --- Phase 3: Populating the DP Table ---
    // Iterate through each element of the number sequence to compute costs for subsequent states.
    for (let currentElementIdx = 1; currentElementIdx <= sequenceLength; currentElementIdx++) {
        // Retrieve the current number from our sequence (adjusting for 0-based indexing).
        const currentNumber = numberSequence[currentElementIdx - 1];

        // Calculate costs related to the parity of the current number.
        // `costIfEven`: Cost incurred if the current number is treated as even.
        // Special rule: if the number is 0, the cost is 2; otherwise, it's its parity (0 for even, 1 for odd).
        let costIfEven;
        if (currentNumber === 0) {
            costIfEven = 2;
        } else {
            costIfEven = currentNumber % 2;
        }

        // `costIfOdd`: Cost incurred if the current number is treated as odd.
        // If the number is even, cost is 1; if odd, cost is 0.
        const costIfOdd = (currentNumber % 2 === 0) ? 1 : 0;

        // Fetch the costs from the previous row (`currentElementIdx - 1`) to
        // compute the costs for the current row. Using distinct variables improves readability.
        const previousRowCosts = dpCosts[currentElementIdx - 1];
        const prevCostState0 = previousRowCosts[0];
        const prevCostState1 = previousRowCosts[1];
        const prevCostState2 = previousRowCosts[2];
        const prevCostState3 = previousRowCosts[3];
        const prevCostState4 = previousRowCosts[4];

        // Apply the dynamic programming recurrence relations for each of the 5 states.
        // Each state's cost is derived from minimums of previous states plus current element costs.

        // State 0: Represents a cumulative sum of the sequence elements.
        dpCosts[currentElementIdx][0] = prevCostState0 + currentNumber;

        // State 1: Transition from State 0 or State 1, adding the 'costIfEven'.
        dpCosts[currentElementIdx][1] = getMinCost(prevCostState0, prevCostState1) + costIfEven;

        // State 2: Transition from State 0, 1, or 2, adding the 'costIfOdd'.
        dpCosts[currentElementIdx][2] = getMinCost(prevCostState0, prevCostState1, prevCostState2) + costIfOdd;

        // State 3: Transition from State 2 or State 3, adding the 'costIfEven'.
        dpCosts[currentElementIdx][3] = getMinCost(prevCostState2, prevCostState3) + costIfEven;

        // State 4: Transition from any previous state (0-4), adding the 'currentNumber'.
        // This state's cost effectively finds the minimum path considering all prior states
        // and adds the current number's value, similar to State 0 but with more transition options.
        dpCosts[currentElementIdx][4] = getMinCost(prevCostState0, prevCostState1, prevCostState2, prevCostState3, prevCostState4) + currentNumber;
    }

    // --- Phase 4: Determining the Final Result ---
    // After filling the entire DP table, the final answer is the minimum cost
    // found in the last row (after processing all `sequenceLength` elements).
    let finalMinimumOverallCost = Number.MAX_SAFE_INTEGER;
    const costsInLastRow = dpCosts[sequenceLength];

    // Iterate through all states in the last row to find the absolute minimum.
    for (let stateIndex = 0; stateIndex < costsInLastRow.length; stateIndex++) {
        if (costsInLastRow[stateIndex] < finalMinimumOverallCost) {
            finalMinimumOverallCost = costsInLastRow[stateIndex];
        }
    }

    // Output the computed final minimum cost using a dedicated printing function.
    displayCalculatedResult(finalMinimumOverallCost);
}

/**
 * A simple helper function to display the final calculated numerical result.
 * This abstraction allows for easier modification of output methods if needed.
 *
 * @param {number} resultValue - The final minimum cost to be displayed.
 */
function displayCalculatedResult(resultValue) {
    console.log(resultValue);
}

// --- Program Entry Point ---
// Reads input from standard input (typically /dev/stdin in competitive programming environments)
// and passes it to the main processing function.
// This part is kept consistent with typical competitive programming setups.
calculateMinimumPathCost(require("fs").readFileSync("/dev/stdin", "utf8"));