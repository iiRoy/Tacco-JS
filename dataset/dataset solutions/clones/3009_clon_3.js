"use strict";

/**
 * Main entry point for processing problem data.
 * This function orchestrates parsing input, performing calculations,
 * and outputting the final result. It aims to find the maximum
 * greatest common divisor (GCD) achievable by excluding one element
 * from a given list of numbers.
 *
 * @param {string} sourceText The entire input received as a string.
 */
function ProcessInputData(sourceText) {
    // Initialize a specialized utility to extract different data types from the input string.
    const dataInterpreter = new TextInterpreter(sourceText);

    // Read the first integer from the input, which represents the count of subsequent numbers.
    const numberCount = dataInterpreter.extractInteger();

    // --- Input Validation and Edge Case Handling (Type III Addition) ---
    // If the count of numbers is non-positive, there's no meaningful calculation to perform.
    // In such cases, the maximum GCD (excluding one element) can be considered 0.
    if (numberCount <= 0) {
        console.log(0);
        return; // Terminate execution early for invalid or empty inputs.
    }

    // Extract the array of numbers based on the previously read count.
    const numericSequence = dataInterpreter.extractIntegerArray(numberCount);

    // --- Core Logic: Greatest Common Divisor (GCD) Implementation (Type III Rewrite) ---

    /**
     * Computes the Greatest Common Divisor (GCD) of two non-negative integers
     * using an iterative implementation of the Euclidean algorithm.
     * This function ensures that the GCD is always non-negative.
     *
     * @param {number} valueA The first integer.
     * @param {number} valueB The second integer.
     * @returns {number} The greatest common divisor of valueA and valueB.
     */
    const calculateGCD = (valueA, valueB) => {
        // Take absolute values to handle potential negative inputs gracefully,
        // though problem constraints usually imply non-negative.
        let currentA = Math.abs(valueA);
        let currentB = Math.abs(valueB);

        // The Euclidean algorithm continues until the second number becomes zero.
        // At that point, the first number is the GCD.
        while (currentB !== 0) {
            const remainder = currentA % currentB; // Calculate the remainder.
            currentA = currentB;                   // Update currentA to be the previous currentB.
            currentB = remainder;                  // Update currentB to be the remainder.
        }
        return currentA; // The GCD is the final non-zero value of currentA.
    };

    // --- Prefix GCD Accumulation (Type II Renaming, Type III Minor Update) ---

    // Array to store GCDs from the left (prefix GCDs).
    // `leftAccumulatedGCDs[i]` will hold `gcd(numericSequence[0], ..., numericSequence[i-1])`.
    // Size `numberCount + 1` allows for a sentinel at index 0.
    const leftAccumulatedGCDs = new Array(numberCount + 1).fill(0);
    // The GCD of an empty set (before the first element) is conventionally 0 for this pattern.
    // `gcd(X, 0) = X` ensures this works correctly.
    leftAccumulatedGCDs[0] = 0;

    // Iterate forward to compute prefix GCDs.
    for (let currentPosition = 0; currentPosition < numberCount; ++currentPosition) {
        leftAccumulatedGCDs[currentPosition + 1] = calculateGCD(
            leftAccumulatedGCDs[currentPosition],
            numericSequence[currentPosition]
        );
    }

    // --- Suffix GCD Accumulation (Type II Renaming, Type III Minor Update) ---

    // Array to store GCDs from the right (suffix GCDs).
    // `rightAccumulatedGCDs[i]` will hold `gcd(numericSequence[i], ..., numericSequence[numberCount-1])`.
    // Size `numberCount + 1` allows for a sentinel at the last index.
    const rightAccumulatedGCDs = new Array(numberCount + 1).fill(0);
    // The GCD of an empty set (after the last element) is also conventionally 0.
    rightAccumulatedGCDs[numberCount] = 0;

    // Iterate backward to compute suffix GCDs.
    for (let currentPosition = numberCount - 1; currentPosition >= 0; --currentPosition) {
        rightAccumulatedGCDs[currentPosition] = calculateGCD(
            rightAccumulatedGCDs[currentPosition + 1],
            numericSequence[currentPosition]
        );
    }

    // --- Calculate GCDs with One Element Excluded (Type II Renaming) ---

    // This array will store the GCD of the entire sequence, excluding one element at a time.
    // `resultsExcludingOne[i]` will be `gcd(leftAccumulatedGCDs[i], rightAccumulatedGCDs[i+1])`.
    const resultsExcludingOne = new Array(numberCount);

    // Populate the array by combining prefix and suffix GCDs.
    for (let index = 0; index < numberCount; ++index) {
        resultsExcludingOne[index] = calculateGCD(
            leftAccumulatedGCDs[index],
            rightAccumulatedGCDs[index + 1]
        );
    }

    // --- Determine and Output Maximum Result (Type II Renaming) ---

    // Find the largest value among all the GCDs calculated when one element was excluded.
    // `Math.max` works well with the spread operator for array elements.
    const finalMaximumGCD = Math.max(...resultsExcludingOne);

    // Print the computed maximum GCD to standard output.
    console.log(finalMaximumGCD);
}

/**
 * A utility class designed to parse and extract different data types
 * (integers, strings, and arrays thereof) from a raw text input string.
 * It tokenizes the input based on whitespace and provides sequential access.
 */
class TextInterpreter {
    /**
     * Constructs a new TextInterpreter instance.
     * @param {string} sourceContent The raw string data to be parsed.
     * @throws {Error} If the provided sourceContent is not a valid string.
     */
    constructor(sourceContent) {
        // Robust validation for the input source.
        if (typeof sourceContent !== 'string' || sourceContent === null) {
            throw new Error('TextInterpreter: Input source content must be a non-null string for parsing.');
        }

        // Internal pointer to keep track of the current token being read.
        this.tokenReadIndex = 0;
        // Split the input string into an array of tokens, using newlines or spaces as delimiters.
        // Filter out any empty strings that might result from consecutive delimiters.
        this.inputTokens = sourceContent.split(/\n|\s/).filter(token => token.length > 0);
    }

    /**
     * Extracts and returns the next available token as an integer.
     * @returns {number} The parsed integer value.
     * @throws {Error} If no more tokens are available or if the token cannot be parsed as an integer.
     */
    extractInteger() {
        // Guard against reading beyond the available tokens.
        if (this.tokenReadIndex >= this.inputTokens.length) {
            throw new Error('TextInterpreter: Cannot extract integer; end of input stream reached.');
        }
        const tokenString = this.inputTokens[this.tokenReadIndex++];
        const parsedNumber = parseInt(tokenString, 10); // Use radix 10 for explicit decimal parsing.

        // Validate if the parsing was successful.
        if (isNaN(parsedNumber)) {
            throw new Error(`TextInterpreter: Invalid integer format encountered: "${tokenString}"`);
        }
        return parsedNumber;
    }

    /**
     * Extracts an array of integers of a specified length from the input stream.
     * @param {number} count The number of integers to extract into the array.
     * @returns {number[]} An array containing the extracted integer values.
     * @throws {Error} If `count` is not a positive integer or if any integer parsing fails.
     */
    extractIntegerArray(count) {
        // Validate the requested count for array extraction.
        if (typeof count !== 'number' || count <= 0 || !Number.isInteger(count)) {
            throw new Error('TextInterpreter: Count for integer array must be a positive integer.');
        }

        // Utilize Array.from for a concise and functional way to create the array.
        const integersResult = Array.from({ length: count }, () => this.extractInteger());
        return integersResult;
    }

    /**
     * Extracts and returns the next available token as a string.
     * @returns {string} The next string token.
     * @throws {Error} If no more tokens are available.
     */
    extractString() {
        // Guard against reading beyond the available tokens.
        if (this.tokenReadIndex >= this.inputTokens.length) {
            throw new Error('TextInterpreter: Cannot extract string; end of input stream reached.');
        }
        return this.inputTokens[this.tokenReadIndex++];
    }

    /**
     * Extracts an array of strings of a specified length from the input stream.
     * @param {number} count The number of strings to extract into the array.
     * @returns {string[]} An array containing the extracted string values.
     * @throws {Error} If `count` is not a positive integer or if any string extraction fails.
     */
    extractStringArray(count) {
        // Validate the requested count for array extraction.
        if (typeof count !== 'number' || count <= 0 || !Number.isInteger(count)) {
            throw new Error('TextInterpreter: Count for string array must be a positive integer.');
        }

        // Similar to integer array, use Array.from for string array creation.
        const stringsResult = Array.from({ length: count }, () => this.extractString());
        return stringsResult;
    }
}

// --- Environment-Specific Execution Block ---
// This conditional block determines how the program obtains its input
// based on the JavaScript execution environment (e.g., Node.js vs. browser).
if (typeof window === "undefined") {
    // This code path is for Node.js environments.
    // It reads the entire content of standard input synchronously.
    const nodeFileSystem = require("fs");
    const standardInputContent = nodeFileSystem.readFileSync("/dev/stdin", "utf8");
    // Once input is read, delegate to the main processing function.
    ProcessInputData(standardInputContent);
}
// In a browser environment, `window` would be defined, and this block would be skipped.
// Browser-based execution would typically involve different input mechanisms (e.g., HTML forms, API calls).