'use strict'; // Enforce stricter parsing and error handling for robust code.

// --- Global Input Handling Setup ---

// Resume the standard input stream to actively listen for incoming data.
// This is a prerequisite for receiving user or piped input in Node.js applications.
process.stdin.resume();

// Configure the character encoding for the standard input stream.
// 'utf-8' is widely used and supports a broad range of characters.
process.stdin.setEncoding('utf-8');

// A mutable string buffer to accumulate all received chunks of data from stdin.
let collectedRawInput = '';

// An index pointer to keep track of the current line being processed from the
// 'collectedRawInput' array after it's been split into lines.
let currentInputLineIndex = 0;

/**
 * Event listener registered for the 'data' event on the standard input stream.
 * This function is invoked whenever new data becomes available.
 * It appends the received data chunk to our global input buffer.
 * @param {string} chunkOfData - The segment of text data received from stdin.
 */
process.stdin.on('data', function(chunkOfData) {
    collectedRawInput += chunkOfData;
});

/**
 * Event listener for the 'end' event on the standard input stream.
 * This event signifies that no more input will be provided.
 * Upon receiving this signal, the collected input is processed, and the
 * main application logic is initiated.
 * @param {any} endEventIdentifier - A parameter for the event object, often unused.
 */
process.stdin.on('end', function(endEventIdentifier) {
    // Process the raw collected input:
    // 1. Split the entire string by newline characters to get an array of lines.
    // 2. Filter out any empty strings that might result from trailing newlines.
    // 3. Trim whitespace from the beginning and end of each individual line.
    collectedRawInput = collectedRawInput
        .split('\n')
        .filter(Boolean)
        .map(str => str.trim());

    // After all input has been prepared, execute the primary application sequence.
    primaryExecutionSequence();
});

/**
 * Fetches the next available line from the pre-processed input array.
 * This utility function automatically advances the internal line index.
 * It includes a basic boundary check to prevent errors when reading past the end of input.
 * @returns {string} The next line of input, or an empty string if no more lines are available.
 */
function fetchNextInputLine() {
    // Guard clause: Check if the index is out of bounds.
    if (currentInputLineIndex >= collectedRawInput.length) {
        console.warn("Warning: Attempted to read beyond the available input lines. Returning an empty string.");
        return '';
    }
    // Return the current line and then increment the index for the next call.
    return collectedRawInput[currentInputLineIndex++];
}

/**
 * Implements a dynamic programming approach to compute an optimal value or maximum reward.
 * This function determines the highest possible reward for a given 'targetValue'
 * by considering various cost and reward combinations. It uses a memoization table
 * to store and reuse intermediate results, optimizing performance.
 *
 * @param {number} targetValue - The maximum capacity or target state for the calculation.
 * @param {number[]} costArray - An array containing costs for each available option. Expected length is 3.
 * @param {number[]} rewardArray - An array containing rewards corresponding to each cost option. Expected length is 3.
 * @returns {number} The maximum reward achievable for the 'targetValue'. Returns 0 on invalid input.
 */
function determineOptimalPath(targetValue, costArray, rewardArray) {
    // --- Input Validation for the core logic ---
    const requiredCombinationCount = 3;
    if (!Array.isArray(costArray) || costArray.length !== requiredCombinationCount ||
        !Array.isArray(rewardArray) || rewardArray.length !== requiredCombinationCount ||
        targetValue < 0 || !Number.isInteger(targetValue)) {
        console.error(`Error: Invalid inputs provided to determineOptimalPath. Target must be non-negative integer, arrays must be of length ${requiredCombinationCount}.`);
        // In case of invalid inputs, a default/error value is returned to prevent further issues.
        return 0;
    }

    // Initialize a memoization table (DP array) to store the maximum reward
    // for each possible value from 0 up to 'targetValue'.
    // All entries are initially set to 0.
    const memoizationTable = new Array(targetValue + 1).fill(0);

    // Iterate through each possible value from 0 up to the 'targetValue'.
    // 'currentCapacity' represents the current state or capacity being evaluated.
    for (let currentCapacity = 0; currentCapacity <= targetValue; ++currentCapacity) {
        // Initialize 'currentMaxReward' for the current capacity.
        // The original logic initializes this with 'currentCapacity' itself,
        // implying a base reward if no combinations yield a better result.
        let currentMaxReward = currentCapacity;

        // Iterate through each of the fixed combinations (e.g., three types of items).
        for (let combinationIndex = 0; combinationIndex < requiredCombinationCount; ++combinationIndex) {
            const currentOptionCost = costArray[combinationIndex];
            const currentOptionReward = rewardArray[combinationIndex];

            // Check if the current capacity is large enough to "afford" or apply this option.
            if (currentCapacity >= currentOptionCost) {
                // Calculate the potential reward if this option is chosen:
                // It's the maximum reward from the remaining capacity (currentCapacity - currentOptionCost)
                // plus the reward gained from applying the current option.
                const candidateReward = memoizationTable[currentCapacity - currentOptionCost] + currentOptionReward;

                // Update 'currentMaxReward' if the 'candidateReward' is higher.
                currentMaxReward = Math.max(currentMaxReward, candidateReward);
            }
        }
        // Store the computed maximum reward for 'currentCapacity' in the memoization table.
        memoizationTable[currentCapacity] = currentMaxReward;
    }

    // The final result, representing the maximum reward for the 'targetValue',
    // is stored at the 'targetValue' index in the memoization table.
    return memoizationTable[targetValue];
}

/**
 * The primary execution sequence of the application.
 * This function orchestrates reading input, calling the core dynamic programming
 * logic twice with different parameters, and finally displaying the computed result.
 */
function primaryExecutionSequence() {
    // Define the numeric base for parsing integers, typically 10 for decimal.
    const decimalRadix = 10;

    // --- Step 1: Read and validate the initial target value ---
    const rawInitialTargetInput = fetchNextInputLine();
    const initialTargetQuantity = parseInt(rawInitialTargetInput, decimalRadix);

    // Robust validation for the parsed target quantity.
    if (isNaN(initialTargetQuantity) || initialTargetQuantity < 0) {
        console.error(`Fatal Error: Initial target value '${rawInitialTargetInput}' is invalid. Expected a non-negative integer.`);
        return; // Terminate execution if crucial input is malformed.
    }

    // --- Step 2: Read and parse the first set of cost values ---
    const rawFirstCostInputs = fetchNextInputLine();
    const firstOptionCosts = rawFirstCostInputs
        .split(' ')
        .map(itemString => parseInt(itemString, decimalRadix))
        .filter(parsedValue => !isNaN(parsedValue)); // Remove any parsing failures (e.g., empty strings becoming NaN).

    // --- Step 3: Read and parse the second set of reward values ---
    const rawSecondCostInputs = fetchNextInputLine();
    const secondOptionCosts = rawSecondCostInputs
        .split(' ')
        .map(itemString => parseInt(itemString, decimalRadix))
        .filter(parsedValue => !isNaN(parsedValue)); // Ensure only valid numbers are kept.

    // --- Step 4: Perform the first dynamic programming calculation ---
    // This computes an intermediate result using the initial target and the two option sets.
    const intermediateCalculationResult = determineOptimalPath(initialTargetQuantity, firstOptionCosts, secondOptionCosts);

    // Optional: Add a check for the intermediate result if specific conditions are expected.
    if (intermediateCalculationResult < 0 && initialTargetQuantity >= 0) {
        console.warn("Notice: Intermediate calculation yielded a negative value. This might indicate an edge case.");
    }

    // --- Step 5: Perform the second dynamic programming calculation ---
    // This step uses the 'intermediateCalculationResult' as the new target,
    // and critically, it swaps the roles of the 'firstOptionCosts' and 'secondOptionCosts' arrays.
    const finalComputedResult = determineOptimalPath(intermediateCalculationResult, secondOptionCosts, firstOptionCosts);

    // --- Step 6: Output the final result ---
    // Present the final calculated value to the user using a descriptive template literal.
    console.log(`The ultimate derived value after sequential optimization is: ${finalComputedResult}`);
}