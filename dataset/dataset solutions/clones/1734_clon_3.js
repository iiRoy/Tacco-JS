const fileSystem = require('fs');

/**
 * Converts a string line containing space-separated numeric values into an array of BigInts.
 * This function handles trimming and parsing for robust input processing.
 * @param {string} lineContent The input string representing a single line of data.
 * @returns {Array<BigInt>} An array where each element is a BigInt parsed from the line.
 */
function parseNumericLineToBigInts(lineContent) {
    // Ensure the line is clean by trimming whitespace before splitting.
    // Each resulting string segment is then converted to a BigInt.
    return lineContent.trim().split(' ').map(numericString => BigInt(numericString));
}

/**
 * Computes a specific XOR sum from a subset of an array of BigInts.
 * This corresponds to the initial XOR accumulation phase of the puzzle.
 * @param {Array<BigInt>} dataArray The array containing the BigInt elements.
 * @param {BigInt} upperLimit The exclusive upper bound for the iteration index.
 * @returns {BigInt} The calculated cumulative XOR sum.
 */
function calculatePartialXORSum(dataArray, upperLimit) {
    let currentXORValue = 0n; // Initialize the XOR accumulator.

    // Iterate from index 2 up to (but not including) the upperLimit.
    // This loop targets specific elements of the dataArray.
    for (let indexPosition = 2n; indexPosition < upperLimit; indexPosition++) {
        // Defensive check: ensure the index is within the actual bounds of the array.
        // This prevents potential runtime errors if upperLimit exceeds array length.
        if (Number(indexPosition) < dataArray.length) {
            currentXORValue ^= dataArray[Number(indexPosition)]; // Apply XOR operation.
        } else {
            // If the specified upperLimit goes beyond available data,
            // we stop processing further, preserving the current XOR sum.
            break;
        }
    }
    return currentXORValue;
}

/**
 * Encapsulates the core logic for solving the puzzle, taking raw input as a string.
 * This function orchestrates parsing, calculation, and searching.
 * @param {string} rawInputString The full input content read from stdin.
 * @returns {string} The final result as a string: either the found index or '-1'.
 */
function processPuzzleInput(rawInputString) {
    // Initial validation: check if the input string is empty or null.
    if (!rawInputString || rawInputString.trim().length === 0) {
        return '-1'; // No valid input to process.
    }

    const inputLines = rawInputString.trim().split('\n');

    // Essential validation: ensure we have at least two lines of input data.
    if (inputLines.length < 2) {
        return '-1'; // Insufficient data for the puzzle.
    }

    // Parse the first line to extract the primary counter (N in the original problem statement).
    const primaryParameters = parseNumericLineToBigInts(inputLines[0]);
    const mainIterationCount = primaryParameters[0]; // This value controls the XOR sum loop.

    // Parse the second line, which contains the main data array (A in the original).
    const mainDataValues = parseNumericLineToBigInts(inputLines[1]);

    // Extract the first two essential operands from the main data array.
    // These correspond to A[0] and A[1] in the original problem.
    const firstOperand = mainDataValues[0];
    const secondOperand = mainDataValues[1];

    // Compute the initial XOR sum based on specific elements of `mainDataValues`
    // and the `mainIterationCount`. This is the `X` value from the original.
    const precalculatedXORSum = calculatePartialXORSum(mainDataValues, mainIterationCount);

    let solutionDiscovered = false; // Flag to indicate if a matching index is found.
    let resultantIndex = -1n;      // Stores the index if a solution is found.

    // Guard clause: If the first operand (which dictates loop iterations) is negative,
    // the loop would not execute as expected or might lead to an infinite loop if condition was different.
    // Assuming non-negative iteration counts.
    if (firstOperand < 0n) {
        return '-1';
    }

    // Main search loop: iterates based on the 'firstOperand' value.
    // This loop attempts to find an 'i' that satisfies the puzzle's condition.
    for (let currentLoopIndex = 0n; currentLoopIndex < firstOperand; currentLoopIndex++) {
        // Calculate the first component for the XOR comparison: (A[0] - i)
        const componentOne = firstOperand - currentLoopIndex;
        // Calculate the second component for the XOR comparison: (A[1] + i)
        const componentTwo = secondOperand + currentLoopIndex;

        // Compute the XOR result of these two components. This is the 'Y' value from the original.
        const dynamicXORResult = componentOne ^ componentTwo;

        // Compare the dynamically calculated XOR result with the precalculated XOR sum.
        if (precalculatedXORSum === dynamicXORResult) {
            solutionDiscovered = true;          // A solution has been found.
            resultantIndex = currentLoopIndex; // Store the current index.
            break;                              // Exit the loop as the first match is sufficient.
        }
    }

    // Return the found index as a string, or '-1' if no solution was identified.
    return solutionDiscovered ? `${resultantIndex}` : '-1';
}

// Entry point for the script execution.
// This block handles reading input from standard input and outputting the result.
try {
    // Read the entire content of the standard input stream synchronously.
    const rawDataFromFile = fileSystem.readFileSync('/dev/stdin', 'utf8');
    // Process the raw input string to solve the puzzle.
    const puzzleOutcome = processPuzzleInput(rawDataFromFile);
    // Write the final outcome to standard output.
    process.stdout.write(puzzleOutcome);
} catch (executionError) {
    // Catch and handle any errors that occur during file reading or processing.
    // Output an error message to standard error and a default '-1' to standard output.
    process.stderr.write(`An unexpected error occurred: ${executionError.message}\n`);
    process.stdout.write('-1'); // Fallback output in case of failure.
}