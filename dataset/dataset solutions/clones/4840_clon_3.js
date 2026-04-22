// This module facilitates reading input line by line from standard input.
// It creates an interface to process streaming data.
const inputLineProcessor = require('readline').createInterface({
    input: process.stdin, // Directs the input stream from the standard input source.
    output: process.stdout // Directs the output stream to the standard output destination.
});

// An array to store all lines captured from the input stream.
// Using 'const' as the array reference itself won't change, though its contents will.
const capturedInputSegments = [];

/**
 * Event handler for each line received from the input stream.
 * This function processes incoming data by trimming whitespace and
 * appending the cleaned line to our storage array.
 * @param {string} currentSegment - The raw text content of the line just read.
 */
inputLineProcessor.on('line', (currentSegment) => {
    // Ensuring clean data by trimming leading/trailing whitespace from the line.
    capturedInputSegments.push(currentSegment.trim());
});

/**
 * Event handler triggered when the input stream closes.
 * This is the primary entry point for executing the business logic
 * after all input has been successfully gathered.
 */
inputLineProcessor.on('close', () => {
    // --- Input Validation Phase 1: Check for any received input ---
    if (capturedInputSegments.length === 0) {
        console.error("Error: No input lines were provided for processing. Please ensure input is piped or typed.");
        return; // Terminate execution gracefully if no input is found.
    }

    // Retrieve the first line of input, which is expected to contain the numerical parameters.
    const initialLineContent = capturedInputSegments[0];

    // --- Input Validation Phase 2: Validate the content of the first line ---
    if (!initialLineContent || initialLineContent.length === 0) {
        console.error("Error: The first input line is empty or contains no discernible content.");
        return;
    }

    // Split the input line by one or more whitespace characters to extract individual string tokens.
    // Using a regular expression /\s+/ handles multiple spaces between numbers.
    const stringTokenCollection = initialLineContent.split(/\s+/);

    // Convert string tokens into an array of integers.
    // The .map() function attempts to parse each token, and .filter() ensures only valid numbers are kept.
    const numericalParameters = stringTokenCollection
        .map(token => parseInt(token, 10)) // Attempt to parse each token as a base-10 integer.
        .filter(value => !isNaN(value) && typeof value === 'number'); // Keep only finite, valid numbers.

    // --- Input Validation Phase 3: Check for the correct number of numerical parameters ---
    // We expect exactly three parameters: range start, range end, and the divisor.
    if (numericalParameters.length < 3) {
        console.error(`Error: Expected 3 numerical parameters (start, end, divisor), but received ${numericalParameters.length}.`);
        console.error(`Please provide input in the format: "START_NUMBER END_NUMBER DIVISOR_NUMBER"`);
        return;
    }

    // Assign parsed values to clearly named variables for improved readability and maintainability.
    const rangeBeginning = numericalParameters[0];
    const rangeEnding = numericalParameters[1];
    let targetDivisor = numericalParameters[2]; // Changed to 'let' because it might be modified.

    // --- Input Validation Phase 4: Validate the divisor value ---
    if (targetDivisor === 0) {
        console.error("Error: The divisor cannot be zero. Division by zero is undefined.");
        return;
    }
    // Handle negative divisors: For divisibility checks, the magnitude is usually what matters.
    if (targetDivisor < 0) {
        console.warn("Warning: A negative divisor was provided. Using its absolute value for divisibility checks.");
        targetDivisor = Math.abs(targetDivisor); // Update the divisor to its positive equivalent.
    }

    /**
     * Helper function: Calculates the count of numbers within a specified range (inclusive)
     * that are perfectly divisible by a given divisor.
     * This function encapsulates the core counting logic.
     * @param {number} startValue - The starting number of the range.
     * @param {number} endValue - The ending number of the range.
     * @param {number} currentDivisor - The number to check for divisibility against.
     * @returns {number} The total count of divisible numbers found within the range.
     */
    const calculateDivisibleCount = (startValue, endValue, currentDivisor) => {
        let divisibleItemsCounter = 0; // Initialize a counter for numbers meeting the divisibility criterion.

        // Ensure the range is valid (start <= end). If not, swap them to iterate correctly.
        // This adds robustness by handling cases where the input range might be inverted.
        const effectiveRangeStart = Math.min(startValue, endValue);
        const effectiveRangeEnd = Math.max(startValue, endValue);

        // Iterate through each number within the determined effective range.
        for (let currentNumberCandidate = effectiveRangeStart; currentNumberCandidate <= effectiveRangeEnd; currentNumberCandidate++) {
            // Check if the current number is perfectly divisible by the divisor.
            // The modulo operator (%) returns 0 if there is no remainder, indicating perfect divisibility.
            if (currentNumberCandidate % currentDivisor === 0) {
                divisibleItemsCounter++; // Increment the counter if the condition is met.
            }
        }
        return divisibleItemsCounter; // Return the final tally.
    };

    // Execute the core calculation logic using the parsed and validated parameters.
    const finalDivisibleCount = calculateDivisibleCount(rangeBeginning, rangeEnding, targetDivisor);

    // Output the computed result in a user-friendly and descriptive format.
    console.log(`The total number of integers divisible by ${targetDivisor} within the inclusive range [${rangeBeginning}, ${rangeEnding}] is: ${finalDivisibleCount}`);
});