let memoTable = []; // A table to store counts of combinations (dynamic programming array)

// Initialize the 2D array 'memoTable' with dimensions 11x331, filled with zeros.
// The first dimension represents the number of digits used (0 to 10).
// The second dimension represents the sum achieved.
for (let rowIdx = 0; rowIdx <= 10; rowIdx++) {
    memoTable[rowIdx] = []; // Create an inner array for each row
    for (let colIdx = 0; colIdx <= 330; colIdx++) {
        memoTable[rowIdx][colIdx] = 0; // Set initial value to zero
    }
}

let digitFlags = []; // An array to keep track of which digits (0-9) have been used in the current path.
// Initialize all digit flags to 'false', indicating no digits are used initially.
for (let currentDigit = 0; currentDigit <= 9; currentDigit++) {
    digitFlags[currentDigit] = false;
}

/**
 * Recursively calculates and stores combinations of unique digits that form specific sums.
 * This function explores all possible ways to place unique digits (0-9) into 11 positions.
 *
 * @param {number} currentSum - The accumulated sum for the current combination path.
 * @param {number} digitPosition - The current position (0-indexed) where a digit is being placed.
 *                                 This also represents the count of digits already placed.
 */
function calculateCombinations(currentSum, digitPosition) {
    // Increment the count for the current sum and digit position in the memoization table.
    // 'digitPosition' here refers to the count of digits already placed.
    memoTable[digitPosition][currentSum]++;

    // Calculate the next digit position.
    const nextDigitPosition = digitPosition + 1;

    // Base case: If 11 digits have been placed (positions 0 through 10),
    // then this combination path is complete, so return.
    if (nextDigitPosition === 11) {
        return;
    }

    // Iterate through all possible digits from 0 to 9.
    for (let currentDigit = 0; currentDigit <= 9; currentDigit++) {
        // If the current digit has already been used in this combination path, skip it.
        if (digitFlags[currentDigit]) {
            continue;
        }

        // Mark the current digit as used for this path.
        digitFlags[currentDigit] = true;

        // Recursively call the function for the next digit position.
        // The digit's value is multiplied by its position (nextDigitPosition) to contribute to the sum.
        // This simulates the problem's specific sum calculation logic (e.g., 0*1 + 1*2 + ...).
        calculateCombinations(currentSum + currentDigit * nextDigitPosition, nextDigitPosition);

        // Backtrack: Unmark the current digit as used, allowing it to be used in other paths.
        digitFlags[currentDigit] = false;
    }
}

// Initiate the recursive calculation process.
// Start with an initial sum of 0 and at the first digit position (0).
calculateCombinations(0, 0);

// Read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: remove leading/trailing whitespace and split into an array of lines.
const inputLines = rawData.trim().split("\n");

// Iterate over each line of input.
inputLines.forEach(function(lineStr) {
    // Parse the numbers from the current line.
    // Each line is expected to contain two space-separated numbers.
    const parsedNumbers = lineStr.split(" ").map(Number);
    // Extract the target digit count (n) and target sum (s) from the parsed numbers.
    const targetCount = parsedNumbers[0];
    const targetSum = parsedNumbers[1];

    // Retrieve the result from the memoization table.
    // If the entry for the given targetCount and targetSum is undefined (e.g., out of bounds or not computed),
    // default the result to 0. Otherwise, use the stored value.
    const resultValue = (memoTable[targetCount][targetSum] === undefined) ? 0 : memoTable[targetCount][targetSum];

    // Print the calculated result to the console.
    console.log(resultValue);
});
