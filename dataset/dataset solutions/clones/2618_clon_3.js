// This module encapsulates a function designed to calculate a specific type of inversion count
// for an array that is conceptually repeated a given number of times.
// The primary goal is to process input data, validate it, and then apply the core algorithm.

const ProcessInputData = (rawDataString) => {
    // Declare a constant for the modulo operation, enhancing readability and maintainability.
    const MODULO_REFERENCE = 1000000007; // Represents 10^9 + 7, a common prime modulo in competitive programming.

    // --- Input Acquisition and Initial Verification ---
    // Ensure the raw input is treated as a string and extraneous whitespace is removed before splitting.
    const linesOfText = String(rawDataString).trim().split('\n');

    // Implement robust validation for the input structure.
    if (linesOfText.length < 2) {
        console.error("Input Error: Expected at least two lines of data; received fewer.");
        return; // Terminate execution gracefully if input is malformed.
    }

    // Extract numerical tokens from the first line, which should contain array dimensions.
    const dimensionsTokens = linesOfText[0].split(' ');
    if (dimensionsTokens.length < 2) {
        console.error("Input Error: First line requires two space-separated numerical parameters.");
        return;
    }

    // Convert string tokens to numerical values for array size and multiplier.
    // Utilizing `Number()` for explicit type conversion.
    const dataSetSize = Number(dimensionsTokens[0]);
    const repetitionMultiplier = Number(dimensionsTokens[1]);

    // Further validation for the parsed numerical parameters.
    if (isNaN(dataSetSize) || dataSetSize <= 0) {
        console.error("Validation Error: Invalid or non-positive value for data set size (N).");
        return;
    }
    if (isNaN(repetitionMultiplier) || repetitionMultiplier <= 0) {
        console.error("Validation Error: Invalid or non-positive value for repetition multiplier (K).");
        return;
    }

    // Parse the actual sequence of numbers from the second line.
    // Filtering out empty strings ensures robustness against multiple spaces.
    const numericalSequence = linesOfText[1].split(' ').filter(token => token !== '').map(numStr => Number(numStr));

    // Validate the integrity of the parsed numerical sequence.
    if (numericalSequence.length !== dataSetSize) {
        console.error(`Validation Error: Mismatch between declared data set size (${dataSetSize}) and actual elements parsed (${numericalSequence.length}).`);
        return;
    }
    // Check for any non-numeric values that might have resulted from parsing.
    if (numericalSequence.some(value => isNaN(value))) {
        console.error("Validation Error: The numerical sequence contains one or more non-numeric entries.");
        return;
    }

    // --- Core Algorithm Execution ---
    let overallInversionSum = 0; // Initialize the accumulator for the final inversion count.

    // Pre-calculate a coefficient used for inversions spanning different conceptual blocks.
    // This represents the sum of integers from 0 to (K-1), equivalent to K * (K-1) / 2.
    // This value is always an integer, so `Math.floor` is unnecessary.
    const crossBlockContributionFactor = (repetitionMultiplier * (repetitionMultiplier - 1)) / 2;

    // Iterate through each element of the original numerical sequence.
    for (let currentIdx = 0; currentIdx < dataSetSize; ++currentIdx) {
        const currentNumericalValue = numericalSequence[currentIdx];

        // --- Step 1: Calculate inversions with elements appearing AFTER the current element in the same block ---
        // This corresponds to 'u' in the original problem context.
        let inversionsWithinFuturePositions = 0;
        // Employ a standard loop for clarity and to demonstrate structural transformation.
        for (let futureIdx = currentIdx + 1; futureIdx < dataSetSize; ++futureIdx) {
            if (numericalSequence[futureIdx] < currentNumericalValue) {
                inversionsWithinFuturePositions++;
            }
        }

        // --- Step 2: Calculate total elements smaller than the current element anywhere in the sequence ---
        // This corresponds to 'v' in the original problem context.
        let totalSmallerElementsOverall = 0;
        // Another explicit loop for structural alteration.
        for (let anyIdx = 0; anyIdx < dataSetSize; ++anyIdx) {
            if (numericalSequence[anyIdx] < currentNumericalValue) {
                totalSmallerElementsOverall++;
            }
        }

        // Accumulate the inversion counts according to the problem's logic.
        // First component: Inversions where the elements are in the same block or the second element is in a later block,
        // but within the same relative position `j > i`. This applies `repetitionMultiplier` times.
        overallInversionSum = (overallInversionSum + (inversionsWithinFuturePositions * repetitionMultiplier)) % MODULO_REFERENCE;

        // Second component: Inversions where the second element is in an earlier conceptual block.
        // This involves `totalSmallerElementsOverall` for each pair of blocks (p, q) where p < q.
        // The number of such pairs is `crossBlockContributionFactor`.
        // Intermediate products are also taken modulo `MODULO_REFERENCE` to prevent potential overflows.
        let earlierBlockInversions = (totalSmallerElementsOverall % MODULO_REFERENCE) * (crossBlockContributionFactor % MODULO_REFERENCE);
        overallInversionSum = (overallInversionSum + earlierBlockInversions) % MODULO_REFERENCE;
    }

    // Output the final computed sum, ensuring it remains within the specified modulo.
    console.log(overallInversionSum);
};

// --- Execution Entry Point ---
// This self-executing anonymous function manages the input reading process,
// making the script suitable for typical competitive programming environments.
(() => {
    // Detect if the script is running in a Node.js environment with file system access.
    if (typeof require !== 'undefined' && typeof process !== 'undefined' && process.stdin) {
        // Dynamically import the 'fs' (file system) module.
        const fileSystemModule = require('fs');
        // Read the entire standard input stream synchronously.
        const acquiredInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Invoke the main data processing function with the obtained input.
        ProcessInputData(acquiredInputData);
    } else {
        // Provide a fallback or error message for non-Node.js environments.
        console.error("Runtime Warning: Standard input mechanism (fs.readFileSync) not available.");
        console.error("Please ensure the script is run in a compatible Node.js environment or provide input manually.");
        // Example of manual invocation for testing purposes:
        // ProcessInputData("3 2\n1 2 0");
    }
})();