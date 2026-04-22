const displayResult = console.log; // Alias for console.log for consistent output handling

/**
 * Parses a string line containing space-separated numeric values into an array of floats.
 * Handles potential empty strings or non-numeric entries by filtering them out.
 *
 * @param {string} lineContent - The string line to parse.
 * @returns {number[]} An array of floating-point numbers. Returns an empty array if input is invalid or empty.
 */
function parseNumericLine(lineContent) {
    // Guard against invalid input types or empty strings
    if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
        return [];
    }

    // Split the line by one or more whitespace characters
    const stringSegments = lineContent.split(/\s+/);

    // Convert each string segment to a float, then filter out any NaN results
    const numericArray = stringSegments
        .map(str => parseFloat(str))
        .filter(num => !isNaN(num)); // Ensure only valid numbers are included

    return numericArray;
}

/**
 * Computes the Minkowski norm (or L-p norm) between two vectors.
 * This function also handles the special case of the L-infinity norm (Chebyshev distance).
 *
 * @param {number[]} firstVectorComponents - The array of components for the first vector.
 * @param {number[]} secondVectorComponents - The array of components for the second vector.
 * @param {number} exponent - The 'p' value for the Minkowski norm. Use `Infinity` for Chebyshev distance.
 * @returns {number} The calculated norm value.
 */
function calculateVectorNorm(firstVectorComponents, secondVectorComponents, exponent) {
    // Basic validation for vector inputs
    if (!Array.isArray(firstVectorComponents) || !Array.isArray(secondVectorComponents)) {
        displayResult("Error: Invalid vector inputs provided to calculateVectorNorm.");
        return NaN;
    }
    if (firstVectorComponents.length !== secondVectorComponents.length) {
        displayResult("Error: Vector dimensions must match for norm calculation.");
        return NaN;
    }
    if (firstVectorComponents.length === 0) {
        return 0; // Norm of empty vectors is 0
    }

    const vectorDimension = firstVectorComponents.length;
    let accumulatedPowerSum = 0;
    let maximumAbsoluteDifference = 0; // Used specifically for L-infinity norm

    // Special handling for the L-infinity norm (Chebyshev distance)
    if (exponent === Infinity) {
        for (let componentIndex = 0; componentIndex < vectorDimension; ++componentIndex) {
            const currentComponentDifference = Math.abs(firstVectorComponents[componentIndex] - secondVectorComponents[componentIndex]);
            if (currentComponentDifference > maximumAbsoluteDifference) {
                maximumAbsoluteDifference = currentComponentDifference;
            }
        }
        return maximumAbsoluteDifference;
    }

    // General case for L-p norms (Minkowski distance)
    for (let componentIndex = 0; componentIndex < vectorDimension; ++componentIndex) {
        const componentDifference = firstVectorComponents[componentIndex] - secondVectorComponents[componentIndex];
        const absoluteComponentDifference = Math.abs(componentDifference);
        accumulatedPowerSum += Math.pow(absoluteComponentDifference, exponent);
    }

    // Edge case: If the sum is extremely small due to floating point arithmetic, treat it as zero.
    // This helps prevent issues like Math.pow(a_very_small_number, 1/p) when it should be 0.
    if (accumulatedPowerSum < Number.EPSILON && exponent > 0) {
        return 0;
    }

    // Return the p-th root of the accumulated sum
    return Math.pow(accumulatedPowerSum, 1 / exponent);
}

/**
 * Main execution flow: reads input, parses vectors, and calculates various norms.
 *
 * @param {string[]} inputDataLines - An array of strings, where each string is a line from the input.
 */
function processVectorAnalysis(inputDataLines) {
    // Ensure we have at least three lines (header, vector A, vector B)
    if (!Array.isArray(inputDataLines) || inputDataLines.length < 3) {
        displayResult("Error: Not enough input lines provided for vector analysis. Expected at least 3.");
        return;
    }

    // Extract raw string data for the vectors from the input array
    const rawVectorDataA = inputDataLines[1];
    const rawVectorDataB = inputDataLines[2];

    // Parse the raw strings into numeric arrays using the dedicated helper
    const vectorA = parseNumericLine(rawVectorDataA);
    const vectorB = parseNumericLine(rawVectorDataB);

    // Perform checks on the parsed vectors before proceeding with calculations
    if (vectorA.length === 0 || vectorB.length === 0) {
        displayResult("Error: One or both input vectors are empty after parsing. Check input format.");
        return;
    }
    if (vectorA.length !== vectorB.length) {
        displayResult("Error: The dimensions of the two vectors do not match. Cannot calculate norms.");
        return;
    }

    // Calculate and output the L1 (Manhattan) norm
    const manhattanDistance = calculateVectorNorm(vectorA, vectorB, 1);
    displayResult(manhattanDistance);

    // Calculate and output the L2 (Euclidean) norm
    const euclideanDistance = calculateVectorNorm(vectorA, vectorB, 2);
    displayResult(euclideanDistance);

    // Calculate and output the L3 (Minkowski with p=3) norm
    const minkowskiP3Distance = calculateVectorNorm(vectorA, vectorB, 3);
    displayResult(minkowskiP3Distance);

    // Calculate and output the L-infinity (Chebyshev) norm
    // This is handled by passing Infinity as the exponent to the generalized norm function
    const chebyshevDistance = calculateVectorNorm(vectorA, vectorB, Infinity);
    displayResult(chebyshevDistance);
}

// --- Application Entry Point ---
// This block simulates the original input reading mechanism from standard input.
try {
    const fileSystemModule = require("fs");
    const standardInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Process the raw input: remove trailing newlines and split into an array of lines
    const processedInputArray = standardInputBuffer
        .replace(/\r?\n$/, "") // Remove the last newline character if present
        .split(/\r?\n/);      // Split the string into an array of lines

    // Initiate the vector analysis with the parsed input lines
    processVectorAnalysis(processedInputArray);
} catch (errorReadingInput) {
    // Catch and log any errors that occur during file reading or initial processing
    displayResult(`Fatal Error: Could not process standard input. Details: ${errorReadingInput.message}`);
    // In a real application, you might provide a fallback or exit gracefully here.
}