// This program processes a series of datasets to find the minimum cumulative cost
// based on a dynamic programming approach. Each dataset involves two sequences
// of numbers and a set of adjustment values.

// --- Configuration Constants ---
// Defines the maximum possible state value for the DP table.
const MAX_POSSIBLE_STATE = 255;
// The initial state value for the DP calculation.
const STARTING_DP_STATE = 128;
// The string signal that indicates the end of input datasets.
const END_OF_INPUT_MARKER = "0 0";
// Represents an unachievable or infinite cost in the DP table.
const IMPOSSIBLE_COST = Number.POSITIVE_INFINITY;

// --- Input Processing ---
// Reads all raw input data from standard input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Splits the raw input into individual lines and cleans up whitespace.
let inputLines = rawInputData.trim().split('\n');

// Main loop to process multiple test cases from the input stream.
// It continues until an explicit termination marker is encountered.
while (true) {
    // Read the line containing the dimensions for the current dataset.
    const dimensionLine = inputLines.shift();

    // If there's no more input or it's empty, break.
    // This also handles cases where `dimensionLine` might be `undefined` if `shift()` returns nothing.
    if (!dimensionLine) break;

    // Parse the dimension values (N and M) from the current line.
    const currentDimensions = dimensionLine.split(' ');

    // Check for the termination signal.
    if (currentDimensions.join(' ') === END_OF_INPUT_MARKER) {
        break; // Exit the loop if the termination marker is found.
    }

    // Convert string dimensions to numbers.
    const sequenceLengthN = Number(currentDimensions[0]); // Corresponds to 'n' in the original.
    const numAdjustmentsM = Number(currentDimensions[1]); // Corresponds to 'm' in the original.

    // Basic validation for dimensions.
    if (isNaN(sequenceLengthN) || isNaN(numAdjustmentsM) || sequenceLengthN < 0 || numAdjustmentsM < 0) {
        // Log an error and skip to the next dataset if dimensions are invalid.
        console.error("Invalid dimensions encountered, skipping dataset.");
        // Consume the remaining lines for this (invalid) dataset to not break future ones.
        // Assuming N lines for reference values and M lines for adjustments.
        for (let i = 0; i < numAdjustmentsM; i++) inputLines.shift();
        for (let i = 0; i < sequenceLengthN; i++) inputLines.shift();
        continue; // Move to the next iteration of the while loop.
    }

    // Read the 'M' adjustment values.
    // Using Array.from with map for cleaner array population.
    const adjustmentValues = Array.from({ length: numAdjustmentsM }, () => {
        const val = Number(inputLines.shift());
        // Add a check for NaN or invalid numbers.
        if (isNaN(val)) {
            console.error("Invalid adjustment value encountered, defaulting to 0.");
            return 0; // Default to 0 or throw an error.
        }
        return val;
    });

    // Read the 'N' reference values.
    const referenceValues = Array.from({ length: sequenceLengthN }, () => {
        const val = Number(inputLines.shift());
        // Add a check for NaN or invalid numbers.
        if (isNaN(val)) {
            console.error("Invalid reference value encountered, defaulting to 0.");
            return 0; // Default to 0 or throw an error.
        }
        return val;
    });

    // Initialize the dynamic programming table (costMatrix).
    // Dimensions: (sequenceLengthN + 1) rows, (MAX_POSSIBLE_STATE + 1) columns.
    const costMatrix = [];
    for (let currentSequenceIdx = 0; currentSequenceIdx <= sequenceLengthN; currentSequenceIdx++) {
        // Fill each row with IMPOSSIBLE_COST initially.
        costMatrix[currentSequenceIdx] = new Array(MAX_POSSIBLE_STATE + 1).fill(IMPOSSIBLE_COST);
    }

    // Set the base case for the DP. The cost at the starting state (index 128)
    // before processing any sequence elements is 0.
    costMatrix[0][STARTING_DP_STATE] = 0;

    // --- Dynamic Programming Calculation ---
    // Iterate through each element of the reference sequence.
    for (let currentSequenceIdx = 1; currentSequenceIdx <= sequenceLengthN; currentSequenceIdx++) {
        // Iterate through all possible previous states.
        for (let prevStateIdx = 0; prevStateIdx <= MAX_POSSIBLE_STATE; prevStateIdx++) {
            // Only proceed if the previous state was reachable (i.e., its cost is not infinite).
            if (costMatrix[currentSequenceIdx - 1][prevStateIdx] !== IMPOSSIBLE_COST) {
                // For each reachable previous state, apply all possible adjustment values.
                for (let adjIdx = 0; adjIdx < numAdjustmentsM; adjIdx++) {
                    const currentAdjustment = adjustmentValues[adjIdx];

                    // Calculate the new state after applying the adjustment.
                    let nextStateIdx = prevStateIdx + currentAdjustment;

                    // Clamp the new state value within the allowed range [0, MAX_POSSIBLE_STATE].
                    nextStateIdx = Math.max(0, Math.min(MAX_POSSIBLE_STATE, nextStateIdx));

                    // Retrieve the reference value for the current step.
                    const referenceValue = referenceValues[currentSequenceIdx - 1];

                    // Calculate the cost for the current transition.
                    // This is the squared difference between the current reference value
                    // and the new state value.
                    const difference = referenceValue - nextStateIdx;
                    // Rewritten from Math.pow(x, 2) to x * x for a minor stylistic change.
                    const squaredDifferenceCost = difference * difference;

                    // Update the cost in the DP table if a cheaper path is found.
                    costMatrix[currentSequenceIdx][nextStateIdx] = Math.min(
                        costMatrix[currentSequenceIdx][nextStateIdx],
                        costMatrix[currentSequenceIdx - 1][prevStateIdx] + squaredDifferenceCost
                    );
                }
            }
        }
    }

    // --- Result Aggregation ---
    // After filling the DP table, find the minimum cost in the last row,
    // which represents the minimum total cost after processing all 'N' elements.
    // Using reduce for a more functional approach to find the minimum value in an array.
    const minimumOverallCost = costMatrix[sequenceLengthN].reduce((accumulator, currentValue) => {
        return Math.min(accumulator, currentValue);
    }, IMPOSSIBLE_COST); // Initialize accumulator with IMPOSSIBLE_COST

    // Output the calculated minimum cost for the current dataset.
    console.log(minimumOverallCost);
}

// End of program.