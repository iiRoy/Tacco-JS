/**
 * @file This script processes input to determine if any number within a specified range
 *       is divisible by a given divisor. It demonstrates Type III code clone generation
 *       with extensive structural and lexical modifications.
 */

/**
 * Analyzes a numerical range for divisibility by a target value.
 * This function takes raw input string, parses it, validates parameters,
 * and performs a divisibility check, outputting 'OK' or 'NG'.
 *
 * @param {string} rawInputContent - The complete input string.
 *                                   Expected format:
 *                                   Line 1: A single integer representing the divisor.
 *                                   Line 2: Two space-separated integers representing the lower and upper bounds of the range.
 */
function evaluateRangeDivisibility(rawInputContent) {
    // Step 1: Preliminary input validation and sanitization
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Execution Aborted: Input content is invalid or empty.");
        return; // Terminate if input is not a valid string
    }

    // Step 2: Deconstruct the input string into constituent lines
    const contentLines = rawInputContent.trim().split('\n');

    // Step 3: Validate the expected number of input lines
    if (contentLines.length < 2) {
        console.error("Execution Aborted: Insufficient input lines. Expected at least two distinct lines.");
        return;
    }

    // Step 4: Parse the numerical divisor from the first line
    const divisorStringSegment = contentLines[0];
    const numericalDivisor = parseInt(divisorStringSegment, 10);

    // Step 5: Validate the parsed divisor value
    if (isNaN(numericalDivisor) || numericalDivisor === 0) {
        console.error("Execution Aborted: The provided divisor is not a valid number or is zero.");
        return;
    }

    // Step 6: Parse the range bounds from the second line
    const rangeBoundSegments = contentLines[1].split(' ');
    if (rangeBoundSegments.length < 2) {
        console.error("Execution Aborted: Invalid format for range bounds. Expected two space-separated numbers.");
        return;
    }

    const startingValue = parseInt(rangeBoundSegments[0], 10);
    const endingValue = parseInt(rangeBoundSegments[1], 10);

    // Step 7: Validate the parsed range bounds
    if (isNaN(startingValue) || isNaN(endingValue)) {
        console.error("Execution Aborted: One or both range bounds are not valid numbers.");
        return;
    }

    // Step 8: Additional validation for range integrity (start <= end)
    if (startingValue > endingValue) {
        // If the range is inverted, no numbers exist within it to check.
        // Therefore, no number can be found divisible.
        console.log('NG');
        return;
    }

    // Step 9: Core logic - Iterating and checking for divisibility
    let isDivisibleNumberFound = false; // Boolean flag to track discovery

    // Loop through each integer from the starting value up to and including the ending value
    for (let currentIterationNumber = startingValue; currentIterationNumber <= endingValue; currentIterationNumber++) {
        // Check if the current number is perfectly divisible by our target divisor
        if (currentIterationNumber % numericalDivisor === 0) {
            isDivisibleNumberFound = true; // Mark as found
            break; // Exit the loop immediately upon finding the first match
        }
    }

    // Step 10: Formulate and display the final outcome
    const finalOutcomeMessage = isDivisibleNumberFound ? 'OK' : 'NG';
    console.log(finalOutcomeMessage);
}

// --- Application Entry Point and Input Handling ---
const standardInputDevicePath = '/dev/stdin'; // Standard path for input stream in Unix-like systems

try {
    // Attempt to load the Node.js file system module
    const fileSystemHandler = require('fs');

    // Read the entire content of the standard input file.
    // It's read as a Buffer first, then converted to a UTF-8 string.
    const rawInputBuffer = fileSystemHandler.readFileSync(standardInputDevicePath);
    const processedInputString = rawInputBuffer.toString('utf8').trim();

    // Invoke the primary function with the obtained input data
    evaluateRangeDivisibility(processedInputString);

} catch (ioError) {
    // Handle any exceptions that occur during file system operations (e.g., file not found, permissions)
    console.error(`An I/O error occurred while attempting to read from ${standardInputDevicePath}: ${ioError.message}`);
    // Exit the process with an error code to indicate failure
    process.exit(1);
}