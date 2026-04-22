// This module provides a solution for a specific combinatorial problem,
// often seen in challenges involving digit sums or Luhn-like algorithms.
// It processes a mixed string of digits and wildcards, and a set of available numbers,
// to count combinations that satisfy a final checksum condition.

const fileSystem = require('fs'); // Renamed `fs` to `fileSystem` for clarity

/**
 * Transforms a numeric value by reducing it if it's 10 or greater.
 * This is similar to summing digits for values >= 10 (e.g., 10 -> 1, 11 -> 2, 18 -> 9, 19 -> 10).
 * For values less than 10, it returns the value unchanged.
 * @param {number} rawValue - The input number to be transformed.
 * @returns {number} The processed, reduced value.
 */
function calculateReducedValue(rawValue) {
    // Rewritten with a ternary operator for conciseness.
    return (rawValue >= 10) ? (rawValue - 9) : rawValue;
}

// --- Input Processing Section ---

// Define a constant for the maximum sum capacity in the DP table.
// The original code used 100, implying sums up to 99.
const MAX_POSSIBLE_SUM = 100;

let rawInputData;
try {
    rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    console.error("Error reading input from /dev/stdin:", error);
    // Exit or handle gracefully if input is essential. For competitive programming, this usually means failing.
    process.exit(1);
}

// Ensure input is not empty after trimming
if (!rawInputData || rawInputData.trim() === '') {
    console.error("Input data is empty.");
    process.exit(1);
}

const inputLines = rawInputData.trim().split("\n");

// Helper function to safely parse an integer from an array and advance the array.
function getNextInteger(dataArray, description = "value") {
    const nextLine = dataArray.shift();
    if (nextLine === undefined || nextLine === null) {
        throw new Error(`Expected ${description} but input line was missing.`);
    }
    const parsedValue = parseInt(nextLine, 10);
    if (isNaN(parsedValue)) {
        throw new Error(`Invalid numeric input for ${description}: "${nextLine}"`);
    }
    return parsedValue;
}

// Helper function to safely parse a string into an array of characters.
function getNextCharacterArray(dataArray, description = "string") {
    const nextLine = dataArray.shift();
    if (nextLine === undefined || nextLine === null) {
        throw new Error(`Expected ${description} but input line was missing.`);
    }
    return Array.from(nextLine); // Using Array.from for clarity over split("")
}

// Helper function to parse an array of space-separated numbers.
function getNextNumberArray(dataArray, description = "array of numbers") {
    const nextLine = dataArray.shift();
    if (nextLine === undefined || nextLine === null) {
        throw new Error(`Expected ${description} but input line was missing.`);
    }
    const numbers = nextLine.split(" ").map(numStr => {
        const parsedNum = parseInt(numStr, 10);
        if (isNaN(parsedNum)) {
            throw new Error(`Invalid number found in ${description}: "${numStr}"`);
        }
        return parsedNum;
    });
    return numbers;
}

// Original 'n' (totalItemsCount) and 'a' (initialValue) were unused. Deleting them.
// const totalItemsCount = getNextInteger(inputLines, "total items count"); // Deleted
// const initialValue = getNextInteger(inputLines, "initial value"); // Deleted

const digitCodeString = getNextCharacterArray(inputLines, "digit code string");
const availableDigits = getNextNumberArray(inputLines, "available digits array");

// Variables to store processed data from the digitCodeString
let wildcardMultipliers = []; // Renamed 'k' to 'wildcardMultipliers'
let baseCalculatedSum = 0;    // Renamed 'sum' to 'baseCalculatedSum'

// --- Processing the Digit Code String ---
// This section iterates through the input digitCodeString,
// calculating a base sum from direct digits and identifying multipliers for wildcards.
for (let charIndex = 0; charIndex < digitCodeString.length; charIndex++) {
    const currentCharacter = digitCodeString[charIndex];
    const isEvenPosition = (charIndex % 2 === 0);

    if (currentCharacter === "*") {
        // If it's a wildcard, store a multiplier based on its position.
        // This multiplier will be used later in the DP calculation.
        wildcardMultipliers.push(isEvenPosition ? 1 : 2);
    } else {
        // If it's a digit, parse its numeric value.
        const numericValue = parseInt(currentCharacter, 10);

        // Basic validation for character type
        if (isNaN(numericValue)) {
            console.warn(`Warning: Non-digit, non-wildcard character found in code string: "${currentCharacter}" at index ${charIndex}. Skipping.`);
            continue; // Skip invalid characters, or throw an error based on strictness.
        }

        // Apply specific calculation rules based on position.
        if (isEvenPosition) {
            baseCalculatedSum += numericValue;
        } else {
            // For odd positions, double the digit and apply reduction, then add to sum.
            const doubledAndReduced = calculateReducedValue(numericValue * 2);
            baseCalculatedSum += doubledAndReduced;
        }
    }
}

// --- Dynamic Programming Setup ---

// The number of wildcard positions determines the depth of our DP table.
const numWildcardPositions = wildcardMultipliers.length;

// Initialize the DP table (combinationsCountTable)
// dpTable[i][s] will store the number of ways to achieve a sum 's'
// using the first 'i' wildcard positions.
// Using Array.from for initialization for clearer structure.
const combinationsCountTable = Array.from({ length: numWildcardPositions + 1 }, () =>
    Array(MAX_POSSIBLE_SUM).fill(0)
);

// Base case: There is one way to achieve a sum of 0 before processing any wildcards.
combinationsCountTable[0][0] = 1;

// --- Dynamic Programming Calculation ---

// Iterate through each wildcard position.
for (let wildcardIdx = 0; wildcardIdx < numWildcardPositions; wildcardIdx++) {
    // Iterate through each available digit that can replace a wildcard.
    for (let digitValIdx = 0; digitValIdx < availableDigits.length; digitValIdx++) {
        const currentDigitFromAvailable = availableDigits[digitValIdx];
        const currentMultiplier = wildcardMultipliers[wildcardIdx];

        // Calculate the value contributed by this digit at this wildcard position.
        const valueContribution = calculateReducedValue(currentDigitFromAvailable * currentMultiplier);

        // Iterate through all possible sums accumulated up to the previous wildcard position.
        for (let prevSumState = 0; prevSumState < MAX_POSSIBLE_SUM; prevSumState++) {
            // If there's no way to reach 'prevSumState' at the previous step, skip.
            if (combinationsCountTable[wildcardIdx][prevSumState] === 0) {
                continue; // Optimization: skip empty states
            }

            // Calculate the new sum state.
            const newSumState = prevSumState + valueContribution;

            // Ensure the new sum state does not exceed our defined capacity.
            // This is a guard clause. If sums can exceed 99 and still be relevant (e.g., modulo 10),
            // the MAX_POSSIBLE_SUM would need adjustment or modulo operation here.
            if (newSumState < MAX_POSSIBLE_SUM) {
                // Add the number of ways from the previous state to the new state.
                combinationsCountTable[wildcardIdx + 1][newSumState] += combinationsCountTable[wildcardIdx][prevSumState];
            } else {
                // This might indicate an issue if sums are expected to wrap around,
                // but based on original context (MAX_POSSIBLE_SUM=100), it implies sums up to 99 are tracked.
                // For a Luhn-like sum, a modulo 10 might be applied here if intermediate sums wrap.
                // However, the final check is `(sum+s)%10==0`, so intermediate sums don't wrap, just need to be tracked.
                // If newSumState >= MAX_POSSIBLE_SUM, it won't be counted in the final loop (0 to 99).
                // So, no explicit action needed here beyond not adding it.
            }
        }
    }
}

// --- Final Calculation and Output ---

let totalValidChecksumCombinations = 0; // Renamed 'ans'

// Helper function for the final checksum validation.
function isValidLuhnLikeChecksum(totalCombinedSum) {
    return totalCombinedSum % 10 === 0;
}

// Iterate through all possible sums accumulated from wildcards.
for (let finalWildcardSum = 0; finalWildcardSum < MAX_POSSIBLE_SUM; finalWildcardSum++) {
    // Calculate the overall sum by adding the base sum (from fixed digits)
    // and the sum accumulated from wildcards.
    const overallCombinedSum = baseCalculatedSum + finalWildcardSum;

    // Check if this combined sum satisfies the final checksum condition (multiple of 10).
    if (isValidLuhnLikeChecksum(overallCombinedSum)) {
        // If valid, add the number of ways to achieve this 'finalWildcardSum'
        // using all wildcard positions to our total count.
        totalValidChecksumCombinations += combinationsCountTable[numWildcardPositions][finalWildcardSum];
    }
}

// Output the final count of valid combinations.
console.log(totalValidChecksumCombinations);