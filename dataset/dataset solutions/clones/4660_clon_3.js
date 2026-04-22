// This module is designed to process a string of numerical data,
// specifically extracting the first two valid integer components
// and performing a modulo-24 sum operation, typically used for
// calculations involving a 24-hour cycle.

/**
 * Calculates a time-based offset from a given input string.
 * It expects a string containing at least two space-separated integers.
 * The function will sum the first two valid integers and return their
 * remainder when divided by 24, effectively providing a result
 * within a 0-23 range.
 *
 * @param {string} inputStringContent The raw string data received for processing.
 *                                    Expected to contain space-separated numbers.
 */
const calculateTimeOffset = (inputStringContent) => {
    // Step 1: Preliminary data sanitization.
    // Remove any leading or trailing whitespace characters from the input.
    const cleanString = inputStringContent.trim();

    // Step 2: Input validation for empty content.
    // If the string becomes empty after trimming, it indicates no meaningful input.
    if (cleanString.length === 0) {
        console.error("Operation Aborted: The provided input string is empty or contains only whitespace.");
        return; // Terminate execution gracefully.
    }

    // Step 3: Decompose the cleaned string into individual components.
    // The components are separated by single space characters.
    const stringComponents = cleanString.split(' ');

    // Step 4: Initialize a container for successfully parsed numerical values.
    const validatedNumbers = [];

    // Step 5: Iterate through each string component to parse and validate.
    // A traditional for loop is used here for explicit control over iteration.
    for (let componentIndex = 0; componentIndex < stringComponents.length; componentIndex++) {
        const currentComponent = stringComponents[componentIndex];

        // Attempt to convert the current string component into a base-10 integer.
        const parsedValue = parseInt(currentComponent, 10);

        // Step 6: Validate the parsed value.
        // Only push to the array if the parsing resulted in a valid number (not NaN).
        if (!isNaN(parsedValue)) {
            validatedNumbers.push(parsedValue);
        } else {
            // Optional: Log a warning if a component could not be parsed.
            // console.warn(`Skipping invalid numerical component: "${currentComponent}"`);
        }
    }

    // Step 7: Final validation for sufficient data.
    // Ensure that at least two valid numbers were successfully extracted.
    const requiredDataPoints = 2;
    if (validatedNumbers.length < requiredDataPoints) {
        console.error(`Processing Error: Insufficient numerical data. Found ${validatedNumbers.length} valid numbers, but ${requiredDataPoints} are required.`);
        return; // Exit if the minimum data requirement is not met.
    }

    // Step 8: Extract the first two operands for the calculation.
    // These are assumed to be the most relevant values for the operation.
    const primaryOperand = validatedNumbers[0];
    const secondaryOperand = validatedNumbers[1];

    // Step 9: Perform the summation of the two extracted operands.
    const cumulativeSum = primaryOperand + secondaryOperand;

    // Step 10: Define the modulus constant.
    // For time-related calculations, 24 is a common modulus (e.g., hours in a day).
    const cycleModulus = 24;

    // Step 11: Calculate the final result using the modulo operator.
    // This wraps the cumulative sum around the specified cycleModulus.
    const finalModuloResult = cumulativeSum % cycleModulus;

    // Step 12: Output the computed result to the standard output stream.
    console.log(finalModuloResult);
};

// --- Application Entry Point & Input Handling ---
// This section is responsible for reading the raw input from the system's
// standard input stream and initiating the data processing workflow.
try {
    // Utilize the Node.js 'fs' module (with 'node:' prefix for clarity)
    // to synchronously read all data from '/dev/stdin' as a UTF-8 string.
    // '/dev/stdin' is a standard Unix-like path for the input stream.
    const rawSystemInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');

    // Delegate the raw input string to the main processing function.
    calculateTimeOffset(rawSystemInput);

} catch (inputReadingError) {
    // If any error occurs during the process of reading from standard input,
    // catch it here and report the issue to the console.
    console.error("Critical System Error: Failed to read input from standard stream.", inputReadingError.message);
    // It's good practice to exit with a non-zero status code to indicate failure.
    process.exit(1);
}