// Type III Clone - Solution for the Coin Summing Problem (Minimum Coins to Reach Target)

// Core module for file system operations, required for input handling.
const ioModule = require('fs');

// Standard path for reading input in competitive programming environments.
const STDIN_FILE_PATH = '/dev/stdin';

// A large constant representing an impossible or unreached state in our dynamic programming table.
// Using Infinity is robust as any valid count will be less than it.
const IMPOSSIBLE_COIN_COUNT = Infinity;

/**
 * Utility function to safely read data from a file.
 * Encapsulates error handling for file operations.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a string, or an empty string on error.
 */
function retrieveFileContents(filePath) {
    try {
        return ioModule.readFileSync(filePath, 'utf8');
    } catch (readError) {
        // Log the error to stderr and return an empty string to allow graceful failure or further checks.
        console.error(`Error reading input from ${filePath}: ${readError.message}`);
        return '';
    }
}

// --- Program Execution Entry Point ---

// 1. Input Acquisition and Initial Processing
// Read the raw input string from the standard input file.
const rawInputString = retrieveFileContents(STDIN_FILE_PATH);

// Split the input into lines, removing any leading/trailing whitespace from the whole input,
// then filter out any completely empty lines that might result from extra newlines.
const parsedInputLines = rawInputString.trim().split('\n').filter(line => line.length > 0);

// Validate that we have at least two lines of input (target/count and denominations).
if (parsedInputLines.length < 2) {
    console.error("Input Error: Not enough lines provided. Expected at least two lines for problem parameters.");
    process.exit(1); // Exit with an error code.
}

// 2. Parsing Problem Parameters (Target Amount and Denomination Count)
// The first line contains the target sum (N) and the number of coin types (M).
const mainParameters = parsedInputLines[0].split(' ');

// Convert string parameters to integers using parseInt with a radix for explicit base-10 conversion.
const desiredSum = parseInt(mainParameters[0], 10);
const totalCoinTypes = parseInt(mainParameters[1], 10);

// Perform robust validation on the parsed numerical parameters.
if (isNaN(desiredSum) || isNaN(totalCoinTypes) || desiredSum < 0 || totalCoinTypes <= 0) {
    console.error("Input Error: Invalid target sum or number of coin types. Must be non-negative for sum, positive for types.");
    process.exit(1);
}

// 3. Parsing Coin Denominations
// The second line contains the space-separated values of the coin denominations.
const coinDenominationValues = parsedInputLines[1]
    .trim()
    .split(' ')
    .filter(str => str.length > 0) // Filter out any empty strings from multiple spaces.
    .map(str => parseInt(str, 10)); // Convert each denomination string to an integer.

// Validate the parsed coin denominations.
if (coinDenominationValues.some(isNaN) || coinDenominationValues.some(val => val <= 0)) {
    console.error("Input Error: All coin denominations must be positive integers.");
    process.exit(1);
}

// Optional: Check if the number of parsed coins matches the declared totalCoinTypes.
// This can catch malformed input or provide a warning.
if (coinDenominationValues.length !== totalCoinTypes) {
    console.warn(`Input Warning: Declared ${totalCoinTypes} coin types, but found ${coinDenominationValues.length}. Proceeding with found denominations.`);
}

// 4. Dynamic Programming Initialization
// Create a DP table (array) where dpTable[i] will store the minimum number of coins
// required to achieve a sum of 'i'.
// Initialize all entries with IMPOSSIBLE_COIN_COUNT, indicating they are not yet reachable.
const minCoinsForSum = new Array(desiredSum + 1).fill(IMPOSSIBLE_COIN_COUNT);

// Base case: It takes 0 coins to achieve a sum of 0.
minCoinsForSum[0] = 0;

// 5. Dynamic Programming Calculation
// Iterate through each possible sum, from 1 up to the desired target sum.
// This represents building up solutions for progressively larger sums.
for (let currentSumAmount = 1; currentSumAmount <= desiredSum; ++currentSumAmount) {
    // For each current sum, iterate through all available coin denominations.
    for (const individualCoinValue of coinDenominationValues) {
        // Check two conditions before attempting to use a coin:
        // 1. The current sum must be greater than or equal to the coin's value.
        // 2. The subproblem (currentSumAmount - individualCoinValue) must be reachable
        //    (i.e., not equal to IMPOSSIBLE_COIN_COUNT).
        const previousSumRequired = currentSumAmount - individualCoinValue;
        if (previousSumRequired >= 0 && minCoinsForSum[previousSumRequired] !== IMPOSSIBLE_COIN_COUNT) {
            // If both conditions are met, we can potentially form currentSumAmount using this coin.
            // Update minCoinsForSum[currentSumAmount] with the minimum of its current value
            // and the number of coins needed for the previousSumRequired plus one (for the current coin).
            minCoinsForSum[currentSumAmount] = Math.min(
                minCoinsForSum[currentSumAmount],
                minCoinsForSum[previousSumRequired] + 1
            );
        }
    }
}

// 6. Outputting the Final Result
// The final answer is stored at the index corresponding to the desiredSum.
const resultMinCoins = minCoinsForSum[desiredSum];

// If the final result is still IMPOSSIBLE_COIN_COUNT, it means the desiredSum cannot be formed.
if (resultMinCoins === IMPOSSIBLE_COIN_COUNT) {
    console.log(-1); // Conventionally, -1 indicates an impossible solution.
} else {
    console.log(resultMinCoins); // Otherwise, print the minimum number of coins.
}