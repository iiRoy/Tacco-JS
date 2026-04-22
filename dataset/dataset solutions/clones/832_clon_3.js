const MAX_POSSIBLE_VALUE = 255;
const INITIAL_REFERENCE_POINT = 128;
const LARGE_IMPOSSIBLE_COST = Number.MAX_SAFE_INTEGER; // Using a large number to represent infinity, avoids potential issues with actual Infinity in some contexts.

/**
 * Safely parses a string into an integer.
 * If the parsing fails, it returns 0 and could optionally log a warning.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer or 0 if invalid.
 */
const parseNumericValue = (inputString) => {
    const parsedValue = parseInt(inputString, 10);
    // Robustness check: Ensure the parsed value is a valid number.
    if (isNaN(parsedValue)) {
        // In a real-world scenario, you might log an error or throw an exception.
        // For competitive programming, usually inputs are guaranteed valid.
        return 0; // Default to 0 for invalid numbers to prevent NaN propagation.
    }
    return parsedValue;
};

// Read all raw input data from the standard input stream.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire content into an array of individual lines,
// trimming any leading/trailing whitespace from the whole block first.
let contentLinesBuffer = rawInputContent.trim().split('\n');

// Begin the main processing loop for handling multiple test cases.
// This loop continues indefinitely until a specific termination signal is encountered.
while (true) {
    // Attempt to retrieve the first line from the buffer, which should contain the problem dimensions.
    // Add a defensive check to ensure there are lines left to process.
    if (contentLinesBuffer.length === 0) {
        // If the buffer is empty, it means we've processed all input or there's malformed input.
        // This break ensures we don't try to access undefined elements.
        break;
    }
    const currentDimensionLine = contentLinesBuffer.shift();
    const dimensionTokens = currentDimensionLine.split(' ');

    // Parse the two dimension values (N and M) from the current line.
    const itemsCount = parseNumericValue(dimensionTokens[0]);
    const offsetsCount = parseNumericValue(dimensionTokens[1]);

    // Check for the problem's termination condition: N=0 and M=0.
    if (itemsCount === 0 && offsetsCount === 0) {
        // If both dimensions are zero, it signals the end of the input sequence.
        break;
    }

    // Initialize an array to store the offset values (M values from the problem description).
    const offsetAmountSet = [];
    // Populate the offsetAmountSet with 'offsetsCount' number of values.
    for (let k = 0; k < offsetsCount; k++) {
        // Ensure there's a line available before attempting to shift.
        if (contentLinesBuffer.length === 0) {
            // This indicates an input format error (not enough offset values).
            // For robustness, add a default value and continue.
            offsetAmountSet.push(0);
            continue;
        }
        offsetAmountSet.push(parseNumericValue(contentLinesBuffer.shift()));
    }

    // Initialize an array to store the target item values (N values from the problem description).
    const targetItemValueSequence = [];
    // Populate the targetItemValueSequence with 'itemsCount' number of values.
    for (let k = 0; k < itemsCount; k++) {
        // Ensure there's a line available before attempting to shift.
        if (contentLinesBuffer.length === 0) {
            // This indicates an input format error (not enough target values).
            targetItemValueSequence.push(0);
            continue;
        }
        targetItemValueSequence.push(parseNumericValue(contentLinesBuffer.shift()));
    }

    // Initialize the dynamic programming memoization table.
    // The table will have (itemsCount + 1) rows and (MAX_POSSIBLE_VALUE + 1) columns.
    // Each cell is initially filled with a value representing an impossible or unreached state.
    const costMemoTable = Array.from({ length: itemsCount + 1 }, () =>
        Array(MAX_POSSIBLE_VALUE + 1).fill(LARGE_IMPOSSIBLE_COST)
    );

    // Establish the base case for the DP:
    // At the start (before processing any items), the cost to be at the INITIAL_REFERENCE_POINT is zero.
    costMemoTable[0][INITIAL_REFERENCE_POINT] = 0;

    // Iterate through each item in the target sequence.
    // The outer loop variable 'currentItemIndex' represents the current item being processed (1-indexed).
    for (let currentItemIndex = 1; currentItemIndex <= itemsCount; currentItemIndex++) {
        // The middle loop iterates through all possible previous state values (0 to MAX_POSSIBLE_VALUE).
        // 'previousStateValue' represents the value of the 'controller' after processing the previous item.
        for (let previousStateValue = 0; previousStateValue <= MAX_POSSIBLE_VALUE; previousStateValue++) {
            // Only proceed if the previous state was reachable (i.e., its cost is not infinite).
            const accumulatedCostToPrevState = costMemoTable[currentItemIndex - 1][previousStateValue];
            if (accumulatedCostToPrevState !== LARGE_IMPOSSIBLE_COST) {
                // The inner loop iterates through each available offset amount.
                for (let offsetArrIndex = 0; offsetArrIndex < offsetsCount; offsetArrIndex++) {
                    const currentOffsetMagnitude = offsetAmountSet[offsetArrIndex];

                    // Calculate the potential new state value by applying the current offset.
                    let rawNextStateCandidate = previousStateValue + currentOffsetMagnitude;

                    // Clamp the new state value to ensure it remains within the valid range [0, MAX_POSSIBLE_VALUE].
                    const finalClampedState = Math.max(0, Math.min(MAX_POSSIBLE_VALUE, rawNextStateCandidate));

                    // Retrieve the target value for the current item being processed.
                    // Note: targetItemValueSequence is 0-indexed, while currentItemIndex is 1-indexed.
                    const currentTargetItemValue = targetItemValueSequence[currentItemIndex - 1];

                    // Calculate the cost incurred in this transition: the squared difference.
                    const valueDifference = currentTargetItemValue - finalClampedState;
                    const transitionPenalty = valueDifference * valueDifference; // (X-Y)^2

                    // Update the DP table: take the minimum of the current cost to reach 'finalClampedState'
                    // and the new calculated cost (cost to previous state + transition penalty).
                    costMemoTable[currentItemIndex][finalClampedState] = Math.min(
                        costMemoTable[currentItemIndex][finalClampedState],
                        accumulatedCostToPrevState + transitionPenalty
                    );
                }
            }
        }
    }

    // After populating the entire DP table, find the minimum cost among all possible final states.
    // The final states are located in the last row of the 'costMemoTable'.
    let minimumAchievableCost = LARGE_IMPOSSIBLE_COST;
    // Iterate through all possible costs in the last row (after processing all 'itemsCount' items).
    for (const costValueAtFinalState of costMemoTable[itemsCount]) {
        // Update the minimumAchievableCost if a smaller cost is found.
        if (costValueAtFinalState < minimumAchievableCost) {
            minimumAchievableCost = costValueAtFinalState;
        }
    }

    // Output the determined minimum cost for the current test case.
    console.log(minimumAchievableCost);
}