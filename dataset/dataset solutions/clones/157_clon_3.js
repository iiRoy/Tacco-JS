// This module handles file system operations.
const fileSystemUtility = require('fs');

// Define constants for Roman numeral symbols and their corresponding integer values.
// These arrays are ordered such that symbols and values align by index.
const romanSymbolChars = ["I", "V", "X", "L", "C", "D", "M"];
const numericEquivalents = [1, 5, 10, 50, 100, 500, 1000];

// A Map is used for efficient lookup of a Roman symbol's integer value.
// It's generally preferred over plain objects for key-value pairs when keys are not simple strings or when iteration order is important.
const romanValueMapping = new Map();
for (let k = 0; k < romanSymbolChars.length; k++) {
    romanValueMapping.set(romanSymbolChars[k], numericEquivalents[k]);
}

/**
 * Converts a Roman numeral string to its integer equivalent.
 * This implementation uses a right-to-left parsing approach.
 * @param {string} romanInputString - The Roman numeral string to convert.
 * @param {Map<string, number>} valueMap - A map from Roman character to its integer value.
 * @returns {number} The integer representation of the Roman numeral, or NaN if invalid characters are present.
 */
function translateRomanToArabic(romanInputString, valueMap) {
    // Handle empty or invalid input strings.
    if (!romanInputString || typeof romanInputString !== 'string' || romanInputString.length === 0) {
        return 0; // An empty string represents 0 in this context.
    }

    let accumulatedSum = 0;
    let maximumValueEncountered = 0; // Tracks the largest value seen so far from the right.

    // Iterate through the Roman numeral string from right to left.
    for (let currentPosition = romanInputString.length - 1; currentPosition >= 0; currentPosition--) {
        const charAtPosition = romanInputString[currentPosition];
        const currentValue = valueMap.get(charAtPosition);

        // Validate if the character is a known Roman numeral.
        if (currentValue === undefined) {
            console.error(`Error: Invalid Roman numeral character '${charAtPosition}' found in input.`);
            return NaN; // Indicate an invalid conversion.
        }

        // Apply the Roman numeral conversion rule:
        // If the current value is less than the maximum value seen to its right, subtract it (e.g., IV = 5 - 1).
        // Otherwise, add it (e.g., VI = 5 + 1).
        if (currentValue < maximumValueEncountered) {
            accumulatedSum -= currentValue;
        } else {
            accumulatedSum += currentValue;
        }

        // Update the maximum value encountered to ensure correct subtraction logic for subsequent characters to the left.
        maximumValueEncountered = Math.max(maximumValueEncountered, currentValue);
    }

    return accumulatedSum;
}

// Attempt to read the input data from a specified file path.
let rawFileContent;
try {
    rawFileContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
    console.error("Failed to read input from /dev/stdin:", readError.message);
    // Exit or handle gracefully if file reading fails.
    process.exit(1);
}

// Pre-process the raw input: remove leading/trailing whitespace and split into individual lines.
const processedInputLines = rawFileContent.trim().split("\n");

// Process each line of the input, treating each as a Roman numeral string.
processedInputLines.forEach(function(singleRomanNumeralEntry, lineIndex) {
    const trimmedEntry = singleRomanNumeralEntry.trim(); // Ensure no leading/trailing whitespace on the line itself.

    // Skip empty lines to prevent unnecessary processing or errors.
    if (trimmedEntry.length === 0) {
        // Optionally, log that an empty line was skipped.
        // console.warn(`Skipping empty line at index ${lineIndex}.`);
        return;
    }

    // Convert the Roman numeral string to its integer value using the helper function.
    const calculatedIntegerResult = translateRomanToArabic(trimmedEntry, romanValueMapping);

    // Output the result to the console, ensuring it's a valid number.
    if (!isNaN(calculatedIntegerResult)) {
        console.log(calculatedIntegerResult);
    } else {
        // If conversion failed (e.g., due to invalid characters), log an error.
        console.error(`Could not convert Roman numeral '${trimmedEntry}' on line ${lineIndex + 1}.`);
    }
});