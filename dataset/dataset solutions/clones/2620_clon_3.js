// This module processes an input string to calculate a specific sum based on inversions and repetitions.
// It reads two lines of input:
// The first line contains two integers, N (elementCount) and K (repetitionFactor).
// The second line contains N space-separated integers, representing the source array.
// The objective is to compute a total cumulative sum, applying a modulo operation at each step
// to prevent integer overflow, based on specific inversion counts.

function computeInversionSum(receivedData) {
    // Define the modulo constant for all arithmetic operations.
    // This value (10^9 + 7) is a common large prime modulus used in competitive programming
    // to keep intermediate results within manageable integer limits.
    const ARITHMETIC_MODULO = 1_000_000_007;

    // Step 1: Parse the initial raw input string by splitting it into individual lines.
    const dataLines = receivedData.split('\n');

    // Step 2: Extract numerical parameters (N and K) from the first line of input.
    // The first line is split by spaces, and each part is converted to an integer.
    const firstLineTokens = dataLines[0].split(' ');
    const elementCount = parseInt(firstLineTokens[0], 10);     // Represents 'N' from the problem statement
    const repetitionFactor = parseInt(firstLineTokens[1], 10); // Represents 'K' from the problem statement

    // Step 2.1: Implement a basic guard clause for edge cases where input parameters are non-positive.
    // If N or K is zero, no calculations are necessary, and the result is 0.
    if (elementCount <= 0 || repetitionFactor <= 0) {
        console.log(0);
        return; // Exit the function early.
    }
    // Additional validation could be added here (e.g., checking for NaN, negative values beyond zero,
    // or if the array line is missing), but competitive programming problems typically guarantee valid input format.

    // Step 3: Parse the array of numbers from the second line of input.
    // The second line is split by spaces, and each string token is converted to an integer.
    const sourceNumericArray = dataLines[1].split(' ').map(strVal => parseInt(strVal, 10));

    // Initialize the main accumulator variable which will store the final result.
    // All additions to this variable will be performed with modulo ARITHMETIC_MODULO.
    let cumulativeResult = 0;

    // Pre-calculate the sum of the arithmetic series from 1 to (K-1), which is K * (K - 1) / 2.
    // This term is used repeatedly in the loop.
    // While K*(K-1) could potentially be large, for typical competitive programming constraints,
    // standard JavaScript numbers usually handle this product before division.
    const kSeriesSumTerm = (repetitionFactor * (repetitionFactor - 1)) / 2;

    // Step 4: Iterate through each element of the 'sourceNumericArray'.
    // In each iteration, 'sourceNumericArray[currentPivotIndex]' acts as a pivot value.
    for (let currentPivotIndex = 0; currentPivotIndex < elementCount; ++currentPivotIndex) {
        const pivotValue = sourceNumericArray[currentPivotIndex];

        // Step 4.1: Calculate 'smallerElementsToRight'.
        // This counts how many elements to the right of the current pivot are strictly smaller than the pivot.
        // This is equivalent to 'u' in the original problem context.
        let smallerElementsToRight = 0;
        for (let j = currentPivotIndex + 1; j < elementCount; ++j) {
            if (sourceNumericArray[j] < pivotValue) {
                smallerElementsToRight++;
            }
        }

        // Step 4.2: Calculate 'totalSmallerElements'.
        // This counts how many elements in the entire 'sourceNumericArray' (from index 0 to N-1)
        // are strictly smaller than the current pivot value.
        // This is equivalent to 'v' in the original problem context.
        let totalSmallerElements = 0;
        for (let j = 0; j < elementCount; ++j) {
            if (sourceNumericArray[j] < pivotValue) {
                totalSmallerElements++;
            }
        }

        // Step 4.3: Calculate the first component of the sum for the current pivot.
        // This component represents the contribution from inversions within the same "block"
        // and between adjacent blocks, scaled by 'repetitionFactor' (K).
        let componentA = (smallerElementsToRight * repetitionFactor) % ARITHMETIC_MODULO;
        cumulativeResult = (cumulativeResult + componentA) % ARITHMETIC_MODULO;

        // Step 4.4: Calculate the second component of the sum for the current pivot.
        // This component represents the contribution from inversions across non-adjacent blocks,
        // scaled by 'totalSmallerElements' and the pre-calculated 'kSeriesSumTerm'.
        let componentB = (totalSmallerElements * kSeriesSumTerm) % ARITHMETIC_MODULO;
        cumulativeResult = (cumulativeResult + componentB) % ARITHMETIC_MODULO;
    }

    // Step 5: Output the final computed cumulative sum.
    console.log(cumulativeResult);
}

// Standard entry point for competitive programming environments:
// Reads all input data from standard input ('/dev/stdin') using Node.js's 'fs' module,
// converts it to a UTF-8 string, and then passes it to the main processing function.
computeInversionSum(require("fs").readFileSync("/dev/stdin", "utf8"));