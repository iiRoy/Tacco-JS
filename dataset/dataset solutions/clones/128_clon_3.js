// Import the core Node.js file system module for synchronous operations.
const nodeFileSys = require('node:fs');

// Define constants for various configuration parameters to improve readability and maintainability.
const INPUT_SOURCE_PATH = "/dev/stdin"; // Specifies the standard input file path.
const DATA_ENCODING_STANDARD = "utf8";   // Defines the character encoding for reading the file.
const HIGHEST_BIT_INDEX = 9;              // Sets the maximum bit position to check (e.g., 9 for 2^9).

/**
 * Safely attempts to parse a string into an integer.
 * This function handles empty strings and non-numeric inputs gracefully.
 *
 * @param {string} rawString - The input string to be parsed.
 * @returns {number | null} The parsed integer value, or null if the string is not a valid integer.
 */
function safelyParseInteger(rawString) {
    const trimmedString = rawString.trim(); // Remove leading/trailing whitespace.

    // If the string is empty after trimming, it's not a valid number for our purpose.
    if (trimmedString === '') {
        return null;
    }

    // Attempt to parse the string into a base-10 integer.
    const parsedValue = parseInt(trimmedString, 10);

    // Validate if the parsed value is a finite number and not NaN (Not a Number).
    if (Number.isNaN(parsedValue) || !Number.isFinite(parsedValue)) {
        return null; // Return null for invalid or non-finite numeric inputs.
    }

    return parsedValue;
}

/**
 * Identifies and retrieves all powers of two (2^n) that are set within the binary representation
 * of a given numeric value, up to a specified maximum bit index.
 * The results are returned in descending order of power.
 *
 * @param {number} inputNumber - The integer value whose bits are to be examined.
 * @param {number} maxBit - The highest bit index (n) to check (e.g., 9 for 2^9).
 * @returns {number[]} An array containing the powers of two corresponding to the set bits,
 *                     ordered from highest to lowest power.
 */
function retrieveSetBitPowers(inputNumber, maxBit) {
    const identifiedPowers = []; // Initialize an array to store the detected powers of two.

    // Iterate through each bit position, starting from the lowest (0) up to the maximum specified bit.
    for (let currentBitPosition = 0; currentBitPosition <= maxBit; currentBitPosition++) {
        // Calculate the current power of two (2^currentBitPosition) using a bit shift.
        const powerValue = 1 << currentBitPosition;

        // Perform a bitwise AND operation to check if the current bit is set in the input number.
        // If the result is non-zero, the bit is set.
        if ((inputNumber & powerValue) !== 0) {
            identifiedPowers.push(powerValue); // Add the power of two to the collection.
        }
    }

    // The original logic implicitly returned powers in descending order due to loop direction.
    // Since we iterated from lowest to highest bit, we reverse the array to match that output order.
    return identifiedPowers.reverse();
}

/**
 * Formats an array of numbers into a single string where numbers are separated by spaces.
 *
 * @param {number[]} valuesArray - An array of numbers to be joined.
 * @returns {string} A space-separated string of the numbers, or an empty string if the input array is empty.
 */
function formatOutputLine(valuesArray) {
    // If the array is empty, return an empty string to prevent joining an empty array.
    if (valuesArray.length === 0) {
        return '';
    }
    return valuesArray.join(' '); // Join the numbers with a single space.
}

// --- Main Execution Flow ---

// Synchronously read the entire content of the input file.
const rawFileData = nodeFileSys.readFileSync(INPUT_SOURCE_PATH, DATA_ENCODING_STANDARD);

// Split the raw data into an array of individual lines (logical records).
const logicalRecords = rawFileData.split('\n');

// Initialize an array to accumulate all the formatted output strings before final display.
const finalOutputLines = [];

// Process each logical record (line) obtained from the input file.
for (const recordSegment of logicalRecords) {
    // Attempt to convert the current record segment into a numeric integer.
    const numericValue = safelyParseInteger(recordSegment);

    // If the record segment could not be parsed into a valid integer, skip to the next record.
    if (numericValue === null) {
        // This acts as a guard clause, preventing further processing of invalid input lines.
        continue;
    }

    // Extract all powers of two that are set within the valid numeric value.
    const activePowers = retrieveSetBitPowers(numericValue, HIGHEST_BIT_INDEX);

    // Only add to the final output collection if at least one power of two was identified.
    // This ensures that lines representing '0' or lines with no set bits do not produce output.
    if (activePowers.length > 0) {
        finalOutputLines.push(formatOutputLine(activePowers));
    }
}

// After processing all input records, iterate through the collected output lines
// and print each one to the console.
for (const outputLine of finalOutputLines) {
    console.log(outputLine);
}