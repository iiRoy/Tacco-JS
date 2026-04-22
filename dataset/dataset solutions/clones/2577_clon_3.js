// This module is designed to process a specific type of numerical sequence
// provided as multi-line string input, calculating a cumulative sum based on
// a custom aggregation rule involving minimums of adjacent elements.
function calculateSequenceValue(rawText) {
    // Stage 1: Decompose the raw input string into manageable lines.
    const inputLines = rawText.split("\n");

    // Implement a preliminary validation to ensure the integrity of the input structure.
    // We anticipate at least two lines: one for parameters, one for data.
    if (inputLines.length < 2) {
        // Log an error and terminate processing if the input is malformed.
        console.error("Input processing terminated: Expected at least two lines of data, but received fewer.");
        return;
    }

    // Stage 2: Extract the primary configuration parameter (N) from the first line.
    // This parameter dictates the expected length of the subsequent data sequence.
    const initialConfigurationTokens = inputLines[0].split(' ');
    const expectedSequenceLength = Number(initialConfigurationTokens[0]);

    // Validate the extracted sequence length to ensure it's a valid positive integer.
    if (isNaN(expectedSequenceLength) || !Number.isInteger(expectedSequenceLength) || expectedSequenceLength < 1) {
        console.error(`Input processing terminated: Invalid sequence length parameter detected: '${initialConfigurationTokens[0]}'. Must be a positive integer.`);
        return;
    }

    // Stage 3: Parse the second line to obtain the array of numerical coefficients.
    // These are the core values upon which the calculation will operate.
    const numericalCoefficients = inputLines[1].split(' ').map(strVal => Number(strVal));

    // Perform validation on the parsed coefficients array.
    // 3a. Check for any non-numeric entries within the coefficient list.
    if (numericalCoefficients.some(val => isNaN(val))) {
        console.error("Input processing terminated: Detected non-numeric entries within the coefficient list.");
        return;
    }

    // 3b. Verify that the actual count of coefficients matches the expected count (N-1).
    // The problem's structure implies that the coefficient list (bList) should have N-1 elements.
    // Special handling for N=1: If N is 1, bList should be empty.
    const requiredCoefficientCount = expectedSequenceLength - 1;
    if (numericalCoefficients.length !== requiredCoefficientCount) {
        console.error(`Input processing terminated: Mismatch in coefficient count. Expected ${requiredCoefficientCount} elements for sequence length ${expectedSequenceLength}, but found ${numericalCoefficients.length}.`);
        return;
    }

    // Stage 4: Handle edge cases or specific conditions for the sequence length.
    // If N=1, the original logic would fail due to array access out of bounds (bList[0], bList[N-2]).
    // For N=1, with an empty coefficient list, the sum is logically zero.
    if (expectedSequenceLength === 1) {
        console.log(0); // For a sequence of length 1, and an empty coefficient array, the cumulative value is 0.
        return;
    }

    // Define a helper function to determine the minimum of two numerical values.
    // This allows for cleaner code and potential future enhancements (e.g., error handling for non-numbers).
    const resolveMinimumPair = (valA, valB) => {
        // For robustness, ensure that values are treated as numbers, even if types are mixed.
        return Math.min(Number(valA), Number(valB));
    };

    // Stage 5: Execute the primary calculation logic.
    // The sum is composed of the first coefficient, the last coefficient,
    // and the minimums of all adjacent pairs between them.
    let cumulativeAggregation = 0; // Initialize the result accumulator.

    // 5a. Incorporate the value of the very first coefficient.
    cumulativeAggregation += numericalCoefficients[0];

    // 5b. Iterate through adjacent pairs of coefficients and add their minimums to the sum.
    // This loop processes all pairs from (index 0, index 1) up to (last_index-1, last_index).
    for (let currentElementIndex = 0; currentElementIndex < numericalCoefficients.length - 1; ++currentElementIndex) {
        const leftOperand = numericalCoefficients[currentElementIndex];
        const rightOperand = numericalCoefficients[currentElementIndex + 1];
        cumulativeAggregation += resolveMinimumPair(leftOperand, rightOperand);
    }

    // 5c. Add the value of the very last coefficient.
    // This corresponds to bList[N-2] in the original problem statement,
    // which is the final element in the `numericalCoefficients` array (length N-1).
    cumulativeAggregation += numericalCoefficients[numericalCoefficients.length - 1];

    // Stage 6: Output the final computed value.
    console.log(cumulativeAggregation);
}

// This is the standard entry point for running the script in a Node.js environment,
// typically used in competitive programming setups to read from standard input.
calculateSequenceValue(require("fs").readFileSync("/dev/stdin", "utf8"));