// This module facilitates interaction with the file system, enabling operations like reading files.
const nodeFileSystem = require('fs');

// --- Configuration Constants for Input Processing ---
// Specifies the path to the standard input stream, common in Unix-like systems.
const sourceInputPath = '/dev/stdin';
// Defines the character encoding to interpret the input file's bytes as text.
const characterEncoding = 'utf8';
// The primary delimiter used to separate distinct lines within the input data.
const lineSplitter = '\n';
// The secondary delimiter used to separate individual numeric values on a single line.
const valueSeparator = ' ';
// The numerical base (radix) to be used when parsing string representations into integers.
const baseForIntegerParsing = 10;

/**
 * Orchestrates the entire process of reading numeric input from a specified source,
 * performing a calculation (average and ceiling), and displaying the final result.
 * This function encapsulates the main execution flow of the script.
 */
function executeCalculationRoutine() {
    // Step 1: Read raw input content synchronously from the designated path.
    // This operation blocks execution until the entire content is read into a buffer.
    const fileContentBuffer = nodeFileSystem.readFileSync(sourceInputPath, characterEncoding);

    // Step 2: Transform the raw buffer content into an array of individual lines.
    // Empty lines or lines containing only whitespace will also be included initially.
    const allTextLines = fileContentBuffer.split(lineSplitter);

    // --- Input Validation: Ensure sufficient data is present ---

    // Guard clause: Check if any lines were successfully read from the input.
    if (allTextLines.length === 0) {
        // If no content, log an error and terminate the routine gracefully.
        console.error("PROGRAM_ERROR: Input stream appears to be empty. No data lines found.");
        return;
    }

    // Step 3: Extract the first significant line from the array of lines.
    // The `shift()` method removes and returns the first element, modifying the array.
    const primaryDataLine = allTextLines.shift();

    // Guard clause: Verify that the extracted first line is not empty or undefined.
    if (!primaryDataLine || primaryDataLine.trim().length === 0) {
        console.error("PROGRAM_ERROR: The first line of input was either empty or invalid. Cannot proceed.");
        return;
    }

    // Step 4: Break down the primary data line into individual string components (potential numbers).
    const stringComponents = primaryDataLine.split(valueSeparator);

    // Guard clause: Confirm that at least two numeric components are available for calculation.
    if (stringComponents.length < 2) {
        console.error(`PROGRAM_ERROR: Expected at least two numeric values on the first line, but found only ${stringComponents.length}.`);
        return;
    }

    // Optional: Warn if more components are present than expected, indicating potential extraneous data.
    if (stringComponents.length > 2) {
        console.warn(`WARNING: More than two values detected on the first line. Only the first two will be processed.`);
    }

    // --- Data Parsing and Type Conversion ---

    // Step 5: Parse the first string component into an integer.
    // `Number.parseInt` is used for robust string-to-integer conversion with a specified radix.
    const firstNumericValue = Number.parseInt(stringComponents[0], baseForIntegerParsing);

    // Guard clause: Validate that the first parsed value is a legitimate number.
    if (isNaN(firstNumericValue)) {
        console.error(`PROGRAM_ERROR: The first value '${stringComponents[0]}' could not be parsed as a valid integer.`);
        return;
    }

    // Step 6: Parse the second string component into an integer.
    const secondNumericValue = Number.parseInt(stringComponents[1], baseForIntegerParsing);

    // Guard clause: Validate that the second parsed value is a legitimate number.
    if (isNaN(secondNumericValue)) {
        console.error(`PROGRAM_ERROR: The second value '${stringComponents[1]}' could not be parsed as a valid integer.`);
        return;
    }

    // --- Core Calculation Logic ---

    // Step 7: Compute the sum of the two successfully parsed numeric values.
    const totalSum = firstNumericValue + secondNumericValue;

    // Step 8: Calculate the arithmetic mean (average) of the sum.
    // Using '2.0' explicitly ensures that the division results in a floating-point number.
    const calculatedMean = totalSum / 2.0;

    // Step 9: Round the calculated average upwards to the nearest whole number.
    // `Math.ceil()` performs the ceiling operation.
    const finalCeilingResult = Math.ceil(calculatedMean);

    // --- Output Display ---

    // Step 10: Present the final computed result to the standard output.
    // A descriptive label is prepended for clarity and context.
    console.log(`CALCULATION_OUTPUT: The ceiling of the average is ${finalCeilingResult}`);
}

// Initiate the execution of the main routine when the script is run.
executeCalculationRoutine();