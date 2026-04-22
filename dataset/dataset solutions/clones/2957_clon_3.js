// This script calculates a specific probability based on two input integers.
// The problem involves determining the average probability of a number 'i'
// reaching or exceeding a threshold 'K' by repeatedly doubling it.

// Importing the Node.js File System module to read input from standard input.
const fileSystemHandler = require('fs');

/**
 * Reads raw text data from a specified file path.
 * @param {string} filePath The path to the input file (e.g., '/dev/stdin').
 * @returns {string} The content of the file as a UTF-8 string.
 */
function obtainInputData(filePath) {
    try {
        return fileSystemHandler.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading input file at ${filePath}:`, error.message);
        process.exit(1); // Terminate if file reading fails
    }
}

/**
 * Parses the initial two numeric parameters from a string.
 * @param {string} rawLine A space-separated string containing two numbers.
 * @returns {Array<number>} An array containing the two parsed integers.
 * @throws {Error} If the input line is malformed or numbers are invalid.
 */
function parseNumericParameters(rawLine) {
    const stringTokens = rawLine.split(' ');
    if (stringTokens.length < 2) {
        throw new Error("Insufficient numeric parameters provided in the input line.");
    }

    const firstParameter = parseInt(stringTokens[0], 10);
    const secondParameter = parseInt(stringTokens[1], 10);

    // Validate parsed numbers
    if (isNaN(firstParameter) || isNaN(secondParameter) || firstParameter <= 0 || secondParameter <= 0) {
        throw new Error("Invalid numeric input: Parameters must be positive integers.");
    }

    return [firstParameter, secondParameter];
}

/**
 * Calculates the probability that a given starting value will reach or exceed
 * a specified threshold by repeatedly doubling itself.
 * @param {number} initialValue The starting integer.
 * @param {number} targetLimit The threshold integer.
 * @returns {number} The probability (1 / 2^doubling_count).
 */
function determineDoublingProbability(initialValue, targetLimit) {
    let currentWorkingValue = initialValue;
    let numberOfDoublings = 0;

    // Loop until the current value meets or exceeds the target limit
    while (currentWorkingValue < targetLimit) {
        currentWorkingValue = currentWorkingValue << 1; // Efficient multiplication by 2
        numberOfDoublings++;
    }

    // The probability is 1 divided by 2 raised to the power of the number of doublings.
    // Using bit shift for 2^N is efficient for positive N.
    return 1.0 / (1 << numberOfDoublings);
}

// Main execution block starts here
(function mainCalculation() {
    // Obtain the entire raw input content from standard input.
    const fullInputContent = obtainInputData('/dev/stdin');
    
    // Split the input into individual lines and extract the first line.
    // Ensure there's at least one line of input.
    const allInputLines = fullInputContent.split('\n');
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        console.error("Error: No valid input line found.");
        process.exit(1);
    }
    const primaryInputLine = allInputLines.shift();

    let countN, limitK;
    try {
        [countN, limitK] = parseNumericParameters(primaryInputLine);
    } catch (error) {
        console.error(`Input parsing error: ${error.message}`);
        process.exit(1);
    }

    let accumulatedOverallProbability = 0.0; // Initialize the result accumulator

    // Iterate through numbers from 1 to N (inclusive)
    for (let currentNumber = 1; currentNumber <= countN; ++currentNumber) {
        // Calculate the probability for the current number to reach K
        const individualElementProbability = determineDoublingProbability(currentNumber, limitK);
        
        // Each number from 1 to N has an equal chance (1/N) of being the starting point.
        // Multiply this initial probability by the individual element's doubling probability.
        const contributionToTotal = (1.0 / countN) * individualElementProbability;
        
        // Add this element's contribution to the total accumulated probability.
        accumulatedOverallProbability += contributionToTotal;
    }

    // Output the final computed probability, formatted to a specific decimal precision.
    // This ensures consistency in output format for floating-point results.
    console.log(accumulatedOverallProbability.toFixed(10));
})(); // Immediately Invoked Function Expression (IIFE) to encapsulate the main logic