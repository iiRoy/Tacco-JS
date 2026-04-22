const systemFileHandler = require('fs');

// --- Configuration and Utilities ---

// Define the file descriptor for standard input.
const standardInputFileDescriptor = process.stdin.fd;

// Helper function to compute the cube of a number.
const computeNumericCube = (baseValue) => baseValue * baseValue * baseValue;

// Helper function to robustly parse a string into an integer.
const safelyParseInteger = (textualData) => {
    const parsedValue = parseInt(textualData, 10);
    // Validate if the parsed result is a valid, finite number.
    if (Number.isNaN(parsedValue) || !Number.isFinite(parsedValue)) {
        console.warn(`[Input Processor] Warning: Failed to convert "${textualData}" to a valid integer. Skipping.`);
        return null; // Indicate a parsing failure.
    }
    return parsedValue;
};

// --- Input Acquisition and Initial Processing ---

let rawDataPayload;
try {
    // Synchronously read all available data from standard input.
    // This approach is common in competitive programming environments where input is piped.
    rawDataPayload = systemFileHandler.readFileSync(standardInputFileDescriptor);
} catch (dataReadError) {
    console.error(`[File System] Critical Error: Unable to read from standard input. Details: ${dataReadError.message}`);
    // In case of error, initialize with an empty buffer to prevent subsequent failures.
    rawDataPayload = Buffer.from('');
}

// Convert the raw buffer content to a UTF-8 string, then split into lines.
// Remove any lines that are empty or contain only whitespace.
const initialTextLines = rawDataPayload.toString('utf8').split('\n').filter(lineContent => lineContent.trim().length > 0);

// Array to store the successfully parsed numbers from the input.
const numericInputSequence = [];
for (const singleLine of initialTextLines) {
    const numberFromLine = safelyParseInteger(singleLine);
    if (numberFromLine !== null) { // Only add if parsing was successful.
        numericInputSequence.push(numberFromLine);
    }
}

// --- Core Logic Function ---

/**
 * Determines the minimum possible sum of three non-negative integers (x, y, z)
 * such that their combination `x + y^2 + z^3` equals the given target value.
 *
 * @param {number} targetSumValue The integer target value.
 * @returns {number} The smallest sum `x + y + z`, or `Infinity` if no solution exists
 *                   (though for non-negative targets, a solution always exists: x=target, y=0, z=0).
 */
function calculateOptimalTriadSum(targetSumValue) {
    // Initialize the minimum sum to a very large value.
    let minimumFoundSum = Number.POSITIVE_INFINITY;

    // A quick check for negative targets; problem context usually implies non-negative.
    if (targetSumValue < 0) {
        // Depending on requirements, could return 0, Infinity, or throw an error.
        // For this problem, 0 implies x=0, y=0, z=0, which sums to 0.
        return 0;
    }

    // Outer loop for the 'z' component (cubic term).
    // The loop continues as long as z^3 does not exceed the target value.
    for (let cubeTermIdentifier = 0; ; cubeTermIdentifier++) {
        const currentCubeValue = computeNumericCube(cubeTermIdentifier);
        if (currentCubeValue > targetSumValue) {
            break; // No need to check larger 'z' values.
        }

        // Calculate the remaining value required after accounting for z^3.
        const remainingForSquareAndLinear = targetSumValue - currentCubeValue;

        // Inner loop for the 'y' component (square term).
        // The loop continues as long as y^2 does not exceed the remaining value.
        for (let squareTermIdentifier = 0; ; squareTermIdentifier++) {
            const currentSquareValue = squareTermIdentifier * squareTermIdentifier; // Using direct multiplication here.
            if (currentSquareValue > remainingForSquareAndLinear) {
                break; // No need to check larger 'y' values.
            }

            // The 'x' component (linear term) is simply the remainder.
            // It is guaranteed to be non-negative by the loop conditions.
            const linearTermIdentifier = remainingForSquareAndLinear - currentSquareValue;

            // Calculate the sum of the three components for the current combination.
            const currentComponentsTotal = linearTermIdentifier + squareTermIdentifier + cubeTermIdentifier;

            // Update the global minimum sum if the current combination yields a smaller total.
            minimumFoundSum = Math.min(minimumFoundSum, currentComponentsTotal);
        }
    }

    return minimumFoundSum;
}

// --- Main Execution Block ---

let inputScanIndex = 0; // Tracks the current position in the parsed input sequence.

// Iterate through the processed numerical inputs.
while (inputScanIndex < numericInputSequence.length) {
    let currentInputDatum = numericInputSequence[inputScanIndex];
    inputScanIndex++; // Advance the index for the next iteration.

    // A specific termination condition: stop processing if the input value is zero.
    if (currentInputDatum === 0) {
        break;
    }

    // Basic validation: ensure the input is a non-negative integer.
    // Although 'safelyParseInteger' handles NaN, this catches other invalid types for the problem logic.
    if (!Number.isInteger(currentInputDatum) || currentInputDatum < 0) {
        console.warn(`[Main Loop] Skipping invalid data entry: '${currentInputDatum}'. Expecting non-negative integers.`);
        continue; // Proceed to the next input in the sequence.
    }

    try {
        // Execute the core logic function and print its result.
        const computedResultValue = calculateOptimalTriadSum(currentInputDatum);
        console.log(computedResultValue);
    } catch (computationFailure) {
        // Log any unexpected errors that occur during the calculation for a specific input.
        console.error(`[Main Loop] Error during calculation for input '${currentInputDatum}': ${computationFailure.message}`);
        // Decide whether to continue or halt based on error severity; here, we continue.
    }
}

// Optional: A final message indicating completion of all input processing.
// console.log("[System] All available input processed.");