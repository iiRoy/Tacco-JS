// This module encapsulates a specific data processing routine.
// It's designed to perform a calculation based on structured textual input.

/**
 * Executes a core computational task by processing a given string payload.
 * The payload is expected to contain two lines:
 * 1. An integer representing an exponent for a base of 3.
 * 2. A space-separated sequence of numbers.
 * The function calculates (3 ^ exponent) - (2 ^ count_of_even_numbers_in_sequence).
 *
 * @param {string} rawInputPayload - The entire raw string input, typically from stdin.
 * @returns {void} - Outputs the computed result directly to the console.
 */
const processComputationalTask = (rawInputPayload) => {
    // Step 1: Initial validation of the incoming data payload.
    // Ensure that the provided input string is not empty or merely whitespace,
    // and that its type is indeed a string.
    if (!rawInputPayload || typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        console.error("Processing halted: Received an empty or invalid input payload. Please provide valid data.");
        // An early return prevents further execution with bad data.
        return;
    }

    // Step 2: Deconstruct the raw input string into its constituent lines.
    // The input is expected to be newline-delimited, creating an array of strings.
    const inputSections = rawInputPayload.split('\n');

    // Step 3: Validate the structural integrity of the input lines.
    // We anticipate at least two distinct lines for our calculation to proceed correctly.
    if (inputSections.length < 2) {
        console.error("Processing halted: Insufficient number of input lines detected. Expected at least two lines for computation.");
        return;
    }

    // Step 4: Extract and parse the exponent from the first line of the input.
    // This numerical value will serve as the power for the base '3' in our primary calculation.
    const exponentStringValue = inputSections[0].trim();
    const numericalExponent = parseInt(exponentStringValue, 10); // Use radix 10 for robust parsing.

    // Step 5: Validate the parsed exponent value.
    // Ensure it's a valid, non-negative integer. Calculations with negative or non-integer
    // exponents might lead to unexpected results in this context.
    if (isNaN(numericalExponent) || numericalExponent < 0) {
        console.error(`Processing halted: Invalid or negative exponent value found: '${exponentStringValue}'. Expected a non-negative integer.`);
        return;
    }

    // Step 6: Compute the first part of the final result: 3 raised to the power of the extracted exponent.
    // Utilizing the ES2016 exponentiation operator (**) for clarity and conciseness.
    const computedPowerBase = 3 ** numericalExponent;

    // Step 7: Process the second line of input to obtain a collection of numbers.
    // This line typically contains space-separated numeric strings.
    const numericStringSequence = inputSections[1].trim();
    const rawNumericalItems = numericStringSequence.split(' ');

    // Step 8: Convert string items to actual numbers, rigorously filtering out any non-numeric entries.
    // The `map` function attempts conversion, marking failures as `null`.
    // The subsequent `filter` step then removes these `null` values, ensuring a clean array of numbers.
    const numericalSequence = rawNumericalItems.map(item => {
        const parsedValue = Number(item); // Using Number() to handle both integers and potential floats.
        return isNaN(parsedValue) ? null : parsedValue; // If conversion fails, set to null.
    }).filter(item => item !== null); // Retain only successfully parsed numerical values.

    // Step 9: Initialize an accumulator for the product based on even numbers found in the sequence.
    // It is set to 1 because it serves as a multiplicative identity.
    let evenFactorAccumulator = 1;

    // Step 10: Iterate through the cleaned numerical sequence to identify even numbers.
    // For each even number encountered, the accumulator is multiplied by 2.
    // This effectively calculates 2 raised to the power of the count of even numbers.
    for (const currentNumericItem of numericalSequence) {
        // Check if the current number is perfectly divisible by 2.
        // This condition holds true for both positive and negative even integers, and even floating points like 4.0.
        if (currentNumericItem % 2 === 0) {
            evenFactorAccumulator *= 2; // Double the accumulator for each even number found.
        }
        // Odd numbers or non-integer even numbers (e.g., 3.5 % 2 !== 0) do not affect the accumulator.
    }

    // Step 11: Perform the final calculation: the difference between the primary power base
    // and the accumulated product derived from the even numbers.
    const finalCalculatedOutcome = computedPowerBase - evenFactorAccumulator;

    // Step 12: Output the computed final result to the standard output stream.
    console.log(finalCalculatedOutcome);
};

// --- Standard Input Acquisition Utility ---

/**
 * Retrieves the entire content from the standard input stream provided to the Node.js process.
 * This is a common pattern for scripting environments, especially in competitive programming contexts,
 * where input data is typically piped or redirected from a file to stdin.
 *
 * @returns {string} The trimmed content of standard input, or an empty string if an error occurs
 *                   during acquisition (e.g., file system error, no input available).
 */
const acquireSystemInputContent = () => {
    try {
        // Attempt to load the built-in Node.js 'fs' (file system) module.
        const fileSystemModule = require('fs');
        // Read the entire file synchronously from '/dev/stdin'.
        // This special path represents the standard input stream on Unix-like operating systems.
        // The 'utf8' encoding ensures that the input is treated as text.
        const inputContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Remove any leading or trailing whitespace (like newlines or spaces) from the entire acquired content.
        return inputContentBuffer.trim();
    } catch (systemError) {
        // If any error occurs during the file reading process (e.g., '/dev/stdin' not found,
        // permissions issues, or general I/O errors), log the error message.
        console.error(`Error during standard input acquisition: ${systemError.message}`);
        // Return an empty string to signify that no valid input could be obtained,
        // preventing subsequent processing with potentially undefined data.
        return '';
    }
};

// --- Script Execution Entry Point ---

// When the script is executed, it first attempts to acquire all available input
// from the system's standard input stream using our dedicated utility function.
const systemProvidedInput = acquireSystemInputContent();

// Subsequently, this acquired input string is passed to the main computational
// task function, initiating the entire data processing workflow.
processComputationalTask(systemProvidedInput);