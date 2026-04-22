'use strict';

/**
 * Helper function to safely parse a string into an integer.
 * It provides a fallback of 0 if parsing fails, although valid input is expected.
 * @param {string} stringValue - The string to be parsed.
 * @returns {number} The parsed integer, or 0 if invalid.
 */
const parseNumericValue = (stringValue) => {
    const numericResult = parseInt(stringValue, 10);
    // In a production environment, more robust error handling might be needed.
    // For competitive programming, invalid numeric input is typically not a test case.
    if (isNaN(numericResult)) {
        console.warn(`Warning: Could not parse "${stringValue}" as a number. Defaulting to 0.`);
        return 0; // Default to 0 for safety.
    }
    return numericResult;
};

/**
 * Main function to process the input, simulate array transformations,
 * and output the final state.
 * @param {string} rawInputData - The complete input string from standard input.
 */
function processInput(rawInputData) {
    // Input validation: Check if the input is present and not just whitespace.
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Error: Received empty or whitespace-only input. Cannot proceed.");
        return; // Terminate execution if input is invalid.
    }

    // Split the input into individual lines, handling common newline characters.
    const inputLines = rawInputData.trim().split(/\r?\n/g);

    // Further input validation: Ensure there are at least two lines for parameters and array data.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines (N K and array elements).");
        return;
    }

    // Parse the first line to extract the array size (N) and the number of iterations (K).
    const dimensionTokens = inputLines[0].split(' ');
    if (dimensionTokens.length < 2) {
        console.error("Error: First line must contain two space-separated numbers (array size and iteration count).");
        return;
    }

    const arraySize = parseNumericValue(dimensionTokens[0]);        // Represents N
    const iterationCount = parseNumericValue(dimensionTokens[1]); // Represents K

    // Validate the parsed array size and iteration count.
    if (arraySize <= 0) {
        console.error("Error: Array size (N) must be a positive integer.");
        return;
    }
    if (iterationCount < 0) {
        console.error("Error: Iteration count (K) cannot be negative.");
        return;
    }

    // Parse the second line to get the initial state of the array.
    const initialArrayStringElements = inputLines[1].split(' ');
    let currentArrayState = initialArrayStringElements.map(parseNumericValue); // Represents array 'A'

    // Type III: Add robustness - Adjust initial array length if it doesn't match 'arraySize'.
    if (currentArrayState.length !== arraySize) {
        console.warn(`Warning: Initial array length (${currentArrayState.length}) does not match specified arraySize (${arraySize}). Adjusting.`);
        if (currentArrayState.length < arraySize) {
            // Pad with zeros if too short
            currentArrayState = currentArrayState.concat(new Array(arraySize - currentArrayState.length).fill(0));
        } else {
            // Truncate if too long
            currentArrayState = currentArrayState.slice(0, arraySize);
        }
    }


    // This array will store the computed counts for the *next* iteration.
    // It's initialized once and then reset for each simulation step.
    let nextIterationCounts = new Array(arraySize).fill(0);

    // The core simulation loop, running for the specified number of iterations.
    for (let currentSimStep = 0; currentSimStep < iterationCount; currentSimStep++) {
        // Type III: Explicitly reset the counts array for the new iteration.
        // This is an alternative to `nextIterationCounts.fill(0);`
        for (let resetIndex = 0; resetIndex < arraySize; resetIndex++) {
            nextIterationCounts[resetIndex] = 0;
        }

        // Iterate through each element in the `currentArrayState`.
        // Each element `currentArrayState[sourceIdx]` dictates a range to increment.
        for (let sourceIdx = 0; sourceIdx < arraySize; sourceIdx++) {
            // Type III: Use a temporary variable to avoid repeated array access and improve readability.
            const spreadDistance = currentArrayState[sourceIdx];

            // Calculate the lower bound of the range. It cannot go below index 0.
            const effectiveLowerBound = Math.max(0, sourceIdx - spreadDistance);

            // Calculate the upper bound of the range. It cannot exceed the last valid index (`arraySize - 1`).
            const effectiveUpperBound = Math.min(arraySize - 1, sourceIdx + spreadDistance);

            // Increment the counts for all positions within the determined range.
            for (let targetIdx = effectiveLowerBound; targetIdx <= effectiveUpperBound; targetIdx++) {
                // Type III: Introduce an intermediate variable for the current count before incrementing.
                // This can sometimes aid debugging or future modifications.
                let existingCount = nextIterationCounts[targetIdx];
                nextIterationCounts[targetIdx] = existingCount + 1;
            }
        }

        // After all elements from `currentArrayState` have been processed for this step,
        // the `nextIterationCounts` becomes the `currentArrayState` for the subsequent step.
        // Type III: Using spread syntax to create a shallow copy, an alternative to `slice(0)`.
        currentArrayState = [...nextIterationCounts];
    }

    // Output the final state of the `nextIterationCounts` array,
    // with elements joined by a space.
    console.log(nextIterationCounts.join(' '));
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// This part is generally kept fixed unless the input mechanism itself needs cloning.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));