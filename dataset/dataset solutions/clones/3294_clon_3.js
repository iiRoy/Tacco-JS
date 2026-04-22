'use strict';

// Global variables to manage the state of standard input processing.
// rawInputBuffer will accumulate all incoming data chunks before final parsing.
let rawInputBuffer = '';
// lineCursor keeps track of which line from the processed input array should be read next.
let lineCursor = 0;

// Set up the standard input stream to be active and to decode data as UTF-8.
process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Event listener for when data chunks are received from standard input.
process.stdin.on('data', (chunkOfData) => {
    rawInputBuffer += chunkOfData; // Append the new chunk to our buffer.
});

// Event listener for when the standard input stream has ended (no more data).
process.stdin.on('end', () => {
    // Once all input is received, process the accumulated buffer.
    // Trim overall whitespace, split into individual lines, remove any empty lines
    // that might result from splitting, and then trim whitespace from each line.
    const cleanedLines = rawInputBuffer
        .trim()
        .split('\n')
        .filter(Boolean) // Removes empty strings from the array (e.g., if input ends with a newline)
        .map((singleLine) => singleLine.trim());

    // Replace the raw string buffer with the cleaned array of input lines.
    rawInputBuffer = cleanedLines;

    // After preparing the input, initiate the main problem-solving logic.
    initiateCalculation();
});

/**
 * Retrieves the next line from the pre-processed input buffer.
 * Advances the internal line cursor after each retrieval.
 *
 * @returns {string} The next line of input as a string.
 */
function fetchNextLine() {
    // Implement a basic guard clause to prevent reading beyond available input.
    if (lineCursor >= rawInputBuffer.length) {
        console.error('Fatal Error: Attempted to read beyond the available input lines.');
        // In a production scenario, one might throw an exception here.
        return '';
    }
    // Return the current line and then increment the cursor for the next call.
    return rawInputBuffer[lineCursor++];
}

/**
 * Parses a string containing space-separated numeric values into an array of numbers.
 * Includes basic validation to ensure only valid numbers are included.
 *
 * @param {string} inputStr - The string to parse, e.g., "10 3 5 8".
 * @returns {number[]} An array of numbers. Returns an empty array if input is invalid.
 */
function parseNumericSequence(inputStr) {
    // Robustness check for invalid input types.
    if (typeof inputStr !== 'string' || inputStr.trim().length === 0) {
        console.warn('Warning: Received non-string or empty input for numeric sequence parsing. Returning empty array.');
        return [];
    }

    const stringTokens = inputStr.split(' ');
    const resultingNumbers = [];

    // Using a for...of loop for explicit iteration and validation,
    // as an alternative to the 'map' method.
    for (const token of stringTokens) {
        const numericalValue = Number(token);
        // Only push if the parsed value is a finite number.
        if (Number.isFinite(numericalValue)) {
            resultingNumbers.push(numericalValue);
        } else {
            console.warn(`Skipping non-numeric token: '${token}'.`);
        }
    }
    return resultingNumbers;
}

/**
 * Converts a given string into an integer.
 * Performs a strict check to ensure the result is indeed an integer.
 *
 * @param {string} inputStr - The string to convert.
 * @returns {number} The integer value, or NaN if the conversion is not a valid integer.
 */
function extractInteger(inputStr) {
    // Using the unary plus operator for type conversion, a common JavaScript idiom.
    const convertedNum = +inputStr;
    // Check if the converted value is a valid integer.
    if (Number.isInteger(convertedNum)) {
        return convertedNum;
    } else {
        console.warn(`Input '${inputStr}' could not be reliably converted to an integer.`);
        return NaN; // Indicate failure to parse as an integer.
    }
}

// The 'getStrArray' function from the original code has been removed
// as it was not utilized by the main logic and therefore considered non-essential
// for this Type III clone.

// -----------------------------------------------------------------------------
// Core application logic for solving the frog jump problem using Dynamic Programming.
// -----------------------------------------------------------------------------

/**
 * Orchestrates the reading of problem inputs and the execution of the
 * dynamic programming algorithm to find the minimum cost path.
 */
function initiateCalculation() {
    // Read the first line of input, expected to contain two numbers:
    // the total number of stones (sequenceLength) and the maximum jump distance (maxJumpDistance).
    const problemParameters = parseNumericSequence(fetchNextLine());

    // Validate that we received at least two parameters.
    if (problemParameters.length < 2) {
        console.error('Problem Setup Error: Expected at least two initial parameters (length, jump distance).');
        return;
    }

    const sequenceLength = problemParameters[0];
    const maxJumpDistance = problemParameters[1];

    // Read the second line of input, which is the sequence of stone heights.
    const inputSequence = parseNumericSequence(fetchNextLine());

    // Validate that the actual length of the input sequence matches the declared length.
    if (inputSequence.length !== sequenceLength) {
        console.error('Input Data Error: The actual stone sequence length does not match the declared length.');
        return;
    }

    // Initialize the dynamic programming array.
    // Each element minimumCostPath[i] will store the minimum cost to reach stone 'i'.
    // Initialize all costs to Infinity, as we are looking for the minimum.
    // This is an alternative to `new Array(len).fill(-1)`.
    const minimumCostPath = Array.from({ length: sequenceLength }, () => Infinity);

    // Base Case 1: The cost to reach the first stone (index 0) is always zero.
    minimumCostPath[0] = 0;

    // Base Case 2: If there's a second stone, calculate the cost to reach it from the first.
    if (sequenceLength > 1) {
        const heightDifferenceAbs = Math.abs(inputSequence[1] - inputSequence[0]);
        minimumCostPath[1] = heightDifferenceAbs;
    }

    // Iterate from the third stone (index 2) up to the last stone.
    for (let currentPosition = 2; currentPosition < sequenceLength; currentPosition++) {
        // Initialize the minimum cost for the current position to Infinity.
        let currentMinCost = Infinity;

        // Iterate through all possible jump sizes, from 1 up to maxJumpDistance.
        for (let stepSize = 1; stepSize <= maxJumpDistance; stepSize++) {
            const previousPosition = currentPosition - stepSize;

            // Ensure that the previous position is a valid index (not negative).
            if (previousPosition >= 0) {
                // Only consider paths from previous positions that are actually reachable (cost is not Infinity).
                if (minimumCostPath[previousPosition] !== Infinity) {
                    const heightJumpCost = Math.abs(inputSequence[currentPosition] - inputSequence[previousPosition]);
                    const totalPotentialCost = minimumCostPath[previousPosition] + heightJumpCost;

                    // Update the minimum cost found so far for the current stone.
                    currentMinCost = Math.min(currentMinCost, totalPotentialCost);
                }
            }
        }
        // Store the calculated minimum cost for the current stone.
        minimumCostPath[currentPosition] = currentMinCost;
    }

    // After the loops, the minimum cost to reach the very last stone is stored
    // at the last index of the minimumCostPath array.
    const finalResult = minimumCostPath[sequenceLength - 1];

    // Output the result. Add a check for reachability as a final guard.
    if (finalResult === Infinity) {
        console.error('Algorithm Error: The last stone was found to be unreachable.');
    } else {
        console.log(finalResult);
    }
}