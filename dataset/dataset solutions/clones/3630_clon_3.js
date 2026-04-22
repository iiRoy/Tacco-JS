"use strict";

/**
 * Primary function to process the given input string and calculate
 * the number of subarrays whose sum is divisible by a specified modulus.
 * This is a classic problem solvable using prefix sums and a hash map.
 *
 * @param {string} rawInputText - The raw string input, typically from stdin.
 */
function ProcessInputData(rawInputText) {
    // Initialize a custom data parsing utility.
    const inputReader = new DataStreamParser(rawInputText);

    // Retrieve the array size (N) and the modulus (M) from the input.
    const sequenceLength = inputReader.retrieveInteger();
    const divisorValue = inputReader.retrieveInteger();

    // --- Type III Addition: Guard Clause / Early Exit ---
    // If the sequence length or divisor is non-positive, no valid subarrays can exist.
    if (sequenceLength <= 0 || divisorValue <= 0) {
        console.log(0); // Output 0 as there are no possible subarrays.
        return; // Terminate execution.
    }

    // Read the array of integers.
    const numericalElements = inputReader.retrieveIntegerArray(sequenceLength);

    // --- Type III Update: Change data structure from plain object to Map ---
    // A Map is used to store the frequency of each remainder (prefix sum % divisorValue).
    // Keys are the remainders, values are their counts.
    const remainderOccurrenceMap = new Map();

    // --- Type III Update: Introduce helper variable for running total ---
    let currentCumulativeSum = 0; // Tracks the sum of elements up to the current point.
    // Initialize the map with the remainder for an empty prefix (sum 0).
    // This accounts for subarrays starting from the beginning that are divisible by divisorValue.
    remainderOccurrenceMap.set(0, 1);

    let totalValidSubarrays = 0; // Accumulator for the final count.

    // Iterate through each element of the numerical sequence.
    for (let elementIdx = 0; elementIdx < sequenceLength; ++elementIdx) {
        // Update the running total.
        currentCumulativeSum += numericalElements[elementIdx];

        // Calculate the current prefix sum modulo divisorValue.
        // The `(X % M + M) % M` pattern ensures a positive result for the modulo operation,
        // even if `currentCumulativeSum` were negative (though not in this problem's constraints with positive numbers).
        const currentRemainder = (currentCumulativeSum % divisorValue + divisorValue) % divisorValue;

        // --- Type III Update: Map operations instead of object property access ---
        // Get the count of this remainder that has been seen before.
        // If the remainder is not yet in the map, its count is 0.
        const priorOccurrences = remainderOccurrenceMap.get(currentRemainder) || 0;

        // Add the number of prior occurrences to the total count.
        // Each prior occurrence indicates a valid subarray ending at the current element.
        totalValidSubarrays += priorOccurrences;

        // Increment the count for the current remainder and store it back in the map.
        remainderOccurrenceMap.set(currentRemainder, priorOccurrences + 1);
    }

    // Output the final computed count.
    console.log(totalValidSubarrays);
}

/**
 * Utility class for parsing a string of input into various data types.
 * It tokenizes the input and provides methods to retrieve integers.
 */
class DataStreamParser {
    /**
     * Constructor for DataStreamParser.
     * @param {string} sourceInputString - The raw string to be parsed.
     */
    constructor(sourceInputString) {
        // --- Type III Update: More robust splitting and filtering ---
        // Splits the input string by one or more whitespace characters (space, tab, newline, etc.)
        // and filters out any empty strings that might result from multiple delimiters.
        this.tokensArray = sourceInputString.split(/[\s\n]+/).filter(Boolean);
        this.readPointer = 0; // Index to keep track of the next token to read.
    }

    /**
     * Retrieves the next token from the stream as an integer.
     * @returns {number} The parsed integer value.
     */
    retrieveInteger() {
        // --- Type III Addition: Input boundary check ---
        if (this.readPointer >= this.tokensArray.length) {
            // In a competitive programming context, this usually means malformed input.
            // For robustness, we might throw an error or return a specific value.
            console.error("Error: Attempted to read past end of input tokens.");
            return NaN; // Indicate an invalid read.
        }

        const tokenString = this.tokensArray[this.readPointer++];
        // --- Type III Update: Explicit radix for parseInt and basic validation ---
        const numericalValue = parseInt(tokenString, 10);

        if (isNaN(numericalValue)) {
            // This is a validation warning. In a production system, this might be an error.
            console.warn(`Validation Warning: Expected an integer, but encountered non-numeric token "${tokenString}".`);
        }
        return numericalValue;
    }

    /**
     * Retrieves an array of 'count' integers from the stream.
     * @param {number} count - The number of integers to retrieve.
     * @returns {number[]} An array containing the parsed integers.
     */
    retrieveIntegerArray(count) {
        const integerSequence = new Array(count);
        for (let k = 0; k < count; ++k) {
            integerSequence[k] = this.retrieveInteger();
        }
        return integerSequence;
    }

    // --- Type III Deletion: Removed unused methods ---
    // The original `getStr` and `getStrArray` methods are not used by the
    // `ProcessInputData` function in this specific context, so they are removed
    // as non-essential fragments for this program's functionality.
}

// Environment-specific execution block.
// This ensures the script runs correctly whether in a Node.js environment (e.g., for competitive programming)
// or potentially in a browser-like environment (though less common for this type of problem).
if (typeof window === "undefined") {
    // Node.js environment:
    // Utilize Node's file system module to read from standard input.
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard input file path on Unix-like systems.
    const characterEncoding = "utf8"; // Specify character encoding for input.

    // Read the entire content of standard input synchronously.
    const inputContent = fileSystemModule.readFileSync(standardInputPath, characterEncoding);

    // Invoke the main processing logic with the obtained input.
    ProcessInputData(inputContent);
} else {
    // Browser or other environments where 'window' is defined:
    // This block serves as a placeholder. In a browser, input might come from
    // a global variable, an AJAX call, or a UI element.
    // For this problem, it's typically executed in Node.js.
    // Example: ProcessInputData(window.globalProblemInput || "");
    console.warn("Script is running in a non-Node.js environment. Input handling may need adjustment.");
}