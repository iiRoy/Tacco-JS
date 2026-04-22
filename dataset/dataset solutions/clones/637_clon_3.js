// This file contains a JavaScript implementation for solving a dynamic programming problem.
// It calculates the minimum cost based on two sets of numerical inputs.

// --- Global Input Handling System ---

// A buffer to accumulate all incoming data chunks from standard input.
let rawInputAccumulator = '';
// A counter to track the current position within the parsed input tokens array.
let currentTokenPointer = 0;
// An array to store all input tokens after parsing and splitting.
let processedInputTokens = [];

/**
 * Retrieves the next token from the global input stream.
 * By default, it attempts to parse the token as a number.
 *
 * @param {string} [returnType='number'] - Specifies the desired type for the returned token ('number' or 'string').
 * @returns {number | string} The next token, parsed according to `returnType`.
 * @throws {Error} If the end of the input stream is reached unexpectedly.
 */
function acquireNextInputToken(returnType = 'number') {
    // Check if we have exhausted all available input tokens.
    if (currentTokenPointer >= processedInputTokens.length) {
        // Log an error and throw to indicate an issue with input consumption.
        console.error("Error: Attempted to read beyond the available input tokens.");
        throw new Error("End of input stream reached.");
    }
    // Retrieve the token at the current pointer and advance the pointer.
    const retrievedToken = processedInputTokens[currentTokenPointer++];

    // If a string is explicitly requested, return it as is.
    if (returnType === 'string') {
        return retrievedToken;
    }
    // Otherwise, attempt to convert the token to a number.
    // Using Number() for explicit type conversion.
    return Number(retrievedToken);
}

/**
 * Displays a given value to the console, optionally prefixed with a custom label.
 *
 * @param {*} valueToLog - The value that needs to be outputted.
 * @param {string} [logLabel='Calculated Result'] - An optional string label to prepend to the output.
 */
function presentOutput(valueToLog, logLabel = 'Calculated Result') {
    // Utilize template literals for clear and formatted console output.
    console.log(`${logLabel}: ${valueToLog}`);
}

// --- Auxiliary Iteration Function ---

/**
 * Executes a callback function a specified number of times, passing the current iteration index.
 * This function serves as a generalized loop utility.
 *
 * @param {number} iterationsCount - The total number of times the callback should be invoked.
 * @param {function(number): void} iterationCallback - The function to call for each iteration, receiving the index.
 * @throws {Error} If `iterationsCount` is not a valid non-negative number.
 */
function executeRepeatedly(iterationsCount, iterationCallback) {
    // Basic validation for the iteration count.
    if (typeof iterationsCount !== 'number' || iterationsCount < 0 || !Number.isInteger(iterationsCount)) {
        console.error(`Invalid iteration count provided: ${iterationsCount}. Must be a non-negative integer.`);
        // Depending on desired error handling, one might throw an error here.
        return;
    }
    // Standard for loop to perform the repetitions.
    for (let currentLoopIndex = 0; currentLoopIndex < iterationsCount; ++currentLoopIndex) {
        iterationCallback(currentLoopIndex);
    }
}

// --- Core Algorithm Implementation ---

/**
 * Orchestrates the primary dynamic programming calculation.
 * This function reads problem dimensions, initializes data structures,
 * populates the memoization table, and outputs the final computed minimum cost.
 */
function initiateCostOptimization() {
    // Retrieve the two main dimensions for our problem from the input stream.
    const dimensionDSize = acquireNextInputToken(); // Originally 'n'
    const dimensionCSize = acquireNextInputToken(); // Originally 'm'

    // --- Input Validation and Edge Cases ---
    // Perform initial validation on the dimensions to prevent errors or handle trivial cases.
    if (dimensionDSize < 0 || dimensionCSize < 0) {
        presentOutput("Invalid dimensions. Sizes cannot be negative.", "Error");
        return; // Terminate execution if dimensions are invalid.
    }
    if (dimensionDSize === 0 && dimensionCSize === 0) {
        presentOutput(0, "Trivial Case Result (Both dimensions are zero)");
        return; // If both are zero, the cost is trivially zero.
    }
    // If one dimension is zero and the other is not, the interpretation depends on the problem.
    // For the original problem's DP base cases, this will naturally resolve,
    // but a specific check could be added if needed.

    // Read the values for the first set of items (originally array 'd').
    // Using Array.from with a callback for concise initialization.
    const valuesCollectionD = Array.from({ length: dimensionDSize }, () => acquireNextInputToken());

    // Read the costs for the second set of items (originally array 'c').
    const costsCollectionC = Array.from({ length: dimensionCSize }, () => acquireNextInputToken());

    // --- Dynamic Programming Table Setup ---
    // Initialize the 2D memoization table (originally 'dp').
    // Its dimensions are (dimensionDSize + 1) x (dimensionCSize + 1) to accommodate 1-based indexing for DP states.
    const totalMatrixRows = dimensionDSize + 1;
    const totalMatrixColumns = dimensionCSize + 1;
    const minimumCostMatrix = Array.from({ length: totalMatrixRows }, () => new Array(totalMatrixColumns).fill(0)); // Pre-fill with 0 for consistency.

    // --- Populate the Memoization Table ---
    // Iterate through each cell of the minimumCostMatrix to compute values.
    // `currentDP_Row` corresponds to the (i)th item from `valuesCollectionD`.
    for (let currentDP_Row = 0; currentDP_Row < totalMatrixRows; ++currentDP_Row) {
        // `currentDP_Col` corresponds to the (j)th item from `costsCollectionC`.
        for (let currentDP_Col = 0; currentDP_Col < totalMatrixColumns; ++currentDP_Col) {

            // Handle the base cases for the DP table.
            if (currentDP_Row === 0) {
                // If no items from valuesCollectionD are considered, the cost is 0.
                // This typically means an empty set of D items has no associated cost.
                minimumCostMatrix[currentDP_Row][currentDP_Col] = 0;
            } else if (currentDP_Col === 0) {
                // If no items from costsCollectionC are considered, the cost is effectively infinite.
                // This ensures that using items from D requires pairing with items from C.
                minimumCostMatrix[currentDP_Row][currentDP_Col] = Number.POSITIVE_INFINITY;
            } else {
                // --- Recursive Step: Calculate Minimum Cost ---
                // Option 1: Do not include the current item from costsCollectionC.
                // The cost is inherited from the state where the previous C item was considered.
                const costWithoutCurrentC = minimumCostMatrix[currentDP_Row][currentDP_Col - 1];

                // Option 2: Include/pair the current item from valuesCollectionD with the current item from costsCollectionC.
                // Retrieve the actual values from the 0-indexed input arrays.
                const currentD_ItemValue = valuesCollectionD[currentDP_Row - 1];
                const currentC_ItemCost = costsCollectionC[currentDP_Col - 1];

                // Calculate the cost of this specific pairing.
                const incrementalPairingCost = currentD_ItemValue * currentC_ItemCost;

                // Add this pairing cost to the minimum cost of the subproblem
                // where both the previous D item and previous C item were considered.
                const costWithCurrentPairing = minimumCostMatrix[currentDP_Row - 1][currentDP_Col - 1] + incrementalPairingCost;

                // The current cell's value is the minimum of these two options.
                minimumCostMatrix[currentDP_Row][currentDP_Col] = Math.min(costWithoutCurrentC, costWithCurrentPairing);
            }
        }
    }

    // After filling the entire table, the final minimum cost is located at the bottom-right cell.
    const finalOptimalCost = minimumCostMatrix[dimensionDSize][dimensionCSize];
    presentOutput(finalOptimalCost); // Display the computed result.
}

// --- Standard Input Stream Configuration ---

// Resumes the standard input stream, allowing it to emit 'data' events.
process.stdin.resume();
// Sets the character encoding for the input stream to 'utf8'.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(incomingChunk) {
    // Append the new chunk of data to our accumulator buffer.
    rawInputAccumulator += incomingChunk;
});

// Event listener for when the standard input stream signals its end.
process.stdin.on('end', function() {
    // Process the accumulated raw input:
    // 1. Split the entire buffer by any sequence of whitespace characters.
    // 2. Filter out any empty strings that might result from multiple spaces or leading/trailing whitespace.
    processedInputTokens = rawInputAccumulator.split(/\s+/).filter(token => token.length > 0);

    // Once all input has been successfully parsed, initiate the main calculation logic.
    initiateCostOptimization();
});