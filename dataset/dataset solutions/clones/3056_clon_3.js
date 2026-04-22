// This module provides functionality to determine the minimum alterations
// required to transform a sequence of digits into an alternating 0/1 pattern.

/**
 * Utility function to convert a raw string input into an array of numeric digits.
 * Includes basic validation for non-digit characters.
 * @param {string} inputStringContent - The string containing digits.
 * @returns {number[]} An array of numbers parsed from the input string.
 * @throws {Error} If the input string is invalid or contains non-numeric characters that cannot be processed.
 */
function parseInputStringIntoDigits(inputStringContent) {
    // Perform initial validation on the input type and value.
    if (typeof inputStringContent !== 'string' || inputStringContent === null) {
        throw new Error("Input must be a valid string to process.");
    }

    const cleanedInput = inputStringContent.trim(); // Remove leading/trailing whitespace.
    
    // If the string becomes empty after trimming, return an empty array.
    if (cleanedInput.length === 0) {
        return []; 
    }

    // Utilize Array.from to iterate over each character and convert it to a number.
    const numericDigitArray = Array.from(cleanedInput, singleCharValue => {
        const convertedNumericValue = Number(singleCharValue);
        
        // Validate that each character was indeed a single digit (0-9).
        if (isNaN(convertedNumericValue) || convertedNumericValue < 0 || convertedNumericValue > 9) {
            // Throw an error for invalid characters to ensure data integrity.
            throw new Error(`Non-digit character '${singleCharValue}' detected in input. Expected only digits 0-9.`);
        }
        return convertedNumericValue;
    });

    return numericDigitArray;
}

/**
 * Calculates the minimum number of changes needed to make a digit sequence
 * alternate between 0 and 1 (either 0101... or 1010...).
 * The function outputs the result to the console.
 * @param {string} rawSequenceData - The raw string of digits to process.
 * @returns {number} The minimum number of transformations required, or -1 if input processing fails.
 */
function calculateMinAlternatingChanges(rawSequenceData) {
    let processedDigits;
    try {
        // Step 1: Pre-process the raw input string into an array of numeric digits.
        // This step includes basic validation for the input data.
        processedDigits = parseInputStringIntoDigits(rawSequenceData);
    } catch (parsingError) {
        // If parsing fails, log the error and return a sentinel value.
        console.error("Critical input processing error:", parsingError.message);
        return -1; // Indicate a failure to process.
    }

    const currentSequenceLength = processedDigits.length;

    // Guard clause: If the sequence is empty, no changes are needed.
    if (currentSequenceLength === 0) {
        return 0;
    }

    // Step 2: Initialize accumulators for sums of digits located at even and odd positions.
    // These sums help in determining the current state of the sequence relative to target patterns.
    let totalSumAtEvenIndices = 0; // Accumulates digits from positions 0, 2, 4, ...
    let totalSumAtOddIndices = 0;  // Accumulates digits from positions 1, 3, 5, ...

    // Step 3: Iterate through the processed digit array to populate the sums.
    // Using Array.prototype.forEach for a concise iteration pattern.
    processedDigits.forEach((digitValue, currentPositionIndex) => {
        // Determine the parity of the current index.
        const isCurrentPositionEven = (currentPositionIndex % 2 === 0);

        // Based on index parity, add the digit's value to the respective sum.
        if (isCurrentPositionEven) {
            totalSumAtEvenIndices += digitValue;
        } else {
            totalSumAtOddIndices += digitValue;
        }
    });

    // Step 4: Calculate the total number of even-indexed and odd-indexed positions in the sequence.
    // These counts are fundamental for calculating the target sums for 0/1 patterns.
    // The number of positions with an even index (0, 2, 4, ...).
    // This can be expressed as Math.ceil(currentSequenceLength / 2).
    const numberOfEvenIndexedPositions = Math.floor(currentSequenceLength / 2) + (currentSequenceLength % 2);

    // The number of positions with an odd index (1, 3, 5, ...).
    // This can be expressed as Math.floor(currentSequenceLength / 2).
    const numberOfOddIndexedPositions = Math.floor(currentSequenceLength / 2);

    // Step 5: Calculate the transformation costs for two distinct alternating patterns.

    // Scenario A: Target sequence is '101010...'
    // - Digits at even indices should ideally be '1'.
    // - Digits at odd indices should ideally be '0'.
    // The cost is the sum of:
    //   (number of even-indexed positions where current digit is 0)
    //   + (number of odd-indexed positions where current digit is 1).
    // This simplifies to: (numberOfEvenIndexedPositions - totalSumAtEvenIndices) + totalSumAtOddIndices
    const costForOneZeroAlternatingPattern = (numberOfEvenIndexedPositions - totalSumAtEvenIndices) + totalSumAtOddIndices;

    // Scenario B: Target sequence is '010101...'
    // - Digits at even indices should ideally be '0'.
    // - Digits at odd indices should ideally be '1'.
    // The cost is the sum of:
    //   (number of even-indexed positions where current digit is 1)
    //   + (number of odd-indexed positions where current digit is 0).
    // This simplifies to: totalSumAtEvenIndices + (numberOfOddIndexedPositions - totalSumAtOddIndices)
    const costForZeroOneAlternatingPattern = totalSumAtEvenIndices + (numberOfOddIndexedPositions - totalSumAtOddIndices);

    // Step 6: Determine the overall minimum cost.
    // The problem requires finding the minimum transformations to achieve EITHER pattern.
    const overallMinimumTransformations = Math.min(costForOneZeroAlternatingPattern, costForZeroOneAlternatingPattern);

    // Output the computed result to the standard console.
    console.log(overallMinimumTransformations);

    // Return the calculated minimum cost for potential further use or testing.
    return overallMinimumTransformations;
}

// Entry point for execution in a Node.js environment, designed for competitive programming setups.
// This block ensures the script can read input from stdin and pass it to the main logic function.
if (typeof require !== 'undefined' && require.main === module) {
    const nodeFileSystemModule = require('fs'); // Renamed 'fs' to 'nodeFileSystemModule' for uniqueness.
    const standardInputFilePath = '/dev/stdin'; // Standard path for input in many Unix-like systems.

    try {
        // Read the entire file content from stdin synchronously, ensuring UTF-8 encoding.
        const rawInputContentFromFile = nodeFileSystemModule.readFileSync(standardInputFilePath, 'utf8');
        // Invoke the primary logic function with the obtained input data.
        calculateMinAlternatingChanges(rawInputContentFromFile);
    } catch (ioOperationError) {
        // Handle potential errors that may occur during file reading operations
        // (e.g., file not found, permission issues, invalid path).
        console.error(`An I/O error was encountered while attempting to read from ${standardInputFilePath}:`, ioOperationError.message);
        // As a robust fallback, attempt to process an empty string.
        // This might result in 0 or -1 depending on the `calculateMinAlternatingChanges` function's internal error handling.
        calculateMinAlternatingChanges("");
    }
}