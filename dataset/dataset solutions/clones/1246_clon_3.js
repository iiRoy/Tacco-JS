// This module provides core file system operations for interacting with the operating system.
const fileSystemUtility = require('fs');

// Define a symbolic constant for the standard input device path, enhancing portability and clarity.
const INPUT_STREAM_DEVICE_PATH = '/dev/stdin';

// Specify the character encoding to be used when reading data from the input stream.
const TEXT_ENCODING_FORMAT = 'ascii';

// Declare a global constant for the mathematical value of Pi, utilizing JavaScript's built-in precision.
const GLOBAL_PI_CONSTANT = Math.PI;

// Set the desired number of fractional digits for all numerical outputs.
const DESIRED_DECIMAL_PLACES = 6;

/**
 * Retrieves raw string data from a specified file path using a given encoding.
 * This function encapsulates the file reading logic.
 *
 * @param {string} sourcePath - The complete path to the file from which data should be read.
 * @param {string} encodingScheme - The encoding format (e.g., 'utf8', 'ascii') for the file content.
 * @returns {string} The entire content of the file as a string.
 */
function obtainFileDataAsString(sourcePath, encodingScheme) {
    // Perform a synchronous read operation to fetch the file's contents.
    return fileSystemUtility.readFileSync(sourcePath, encodingScheme);
}

/**
 * Computes the surface area of a circle.
 * The formula used is A = π * r², where A is the area, π is Pi, and r is the radius.
 *
 * @param {number} radiusMagnitude - The numerical value representing the circle's radius.
 * @param {number} piValue - The numerical value of the constant Pi.
 * @returns {number} The calculated surface area of the circle.
 */
function calculateCircleAreaValue(radiusMagnitude, piValue) {
    // Use Math.pow for explicit exponentiation, making the operation clear.
    return piValue * Math.pow(radiusMagnitude, 2);
}

/**
 * Determines the perimeter (circumference) of a circle.
 * The formula used is C = 2 * π * r, where C is the circumference, π is Pi, and r is the radius.
 *
 * @param {number} radiusMagnitude - The numerical value representing the circle's radius.
 * @param {number} piValue - The numerical value of the constant Pi.
 * @returns {number} The calculated circumference of the circle.
 */
function computeCircleCircumferenceValue(radiusMagnitude, piValue) {
    // Standard formula for circumference.
    return 2 * piValue * radiusMagnitude;
}

/**
 * Formats a given floating-point number to a string with a fixed number of decimal places.
 * This ensures consistent output precision.
 *
 * @param {number} numericalInput - The number that needs to be formatted.
 * @param {number} decimalPrecision - The number of digits to appear after the decimal point.
 * @returns {string} The formatted number as a string.
 */
function formatNumberForOutput(numericalInput, decimalPrecision) {
    // The toFixed() method converts a number into a string, keeping a specified number of decimals.
    return numericalInput.toFixed(decimalPrecision);
}

/**
 * Main execution block: Orchestrates reading input, performing calculations, and displaying results.
 * This function encapsulates the entire workflow.
 */
function processGeometricCalculations() {
    // Step 1: Obtain the raw input from the designated standard input path.
    const rawInputStringContent = obtainFileDataAsString(INPUT_STREAM_DEVICE_PATH, TEXT_ENCODING_FORMAT);

    // Step 2: Parse the raw string content into a floating-point number.
    // parseFloat is used to handle potential decimal values in the radius.
    const parsedRadiusNumericalValue = parseFloat(rawInputStringContent);

    // Step 3: Implement robust input validation.
    // Check if the parsed value is a valid number and non-negative, as a radius cannot be negative.
    if (isNaN(parsedRadiusNumericalValue) || parsedRadiusNumericalValue < 0) {
        // Output an error message to the standard error stream.
        console.error("Validation Error: The provided input for the circle's radius is either not a number or is negative. Please supply a valid positive numerical value.");
        // Exit the function early to prevent further processing with invalid data.
        return;
    }

    // Step 4: Perform the core mathematical operations using the validated radius.
    // Calculate the area using the dedicated helper function.
    const calculatedAreaResult = calculateCircleAreaValue(parsedRadiusNumericalValue, GLOBAL_PI_CONSTANT);
    // Calculate the circumference using its dedicated helper function.
    const calculatedCircumferenceResult = computeCircleCircumferenceValue(parsedRadiusNumericalValue, GLOBAL_PI_CONSTANT);

    // Step 5: Format the calculated results to the specified decimal precision.
    const formattedAreaString = formatNumberForOutput(calculatedAreaResult, DESIRED_DECIMAL_PLACES);
    const formattedCircumferenceString = formatNumberForOutput(calculatedCircumferenceResult, DESIRED_DECIMAL_PLACES);

    // Step 6: Present the final formatted results to the user via standard output.
    // The area and circumference are printed on a single line, separated by a space.
    console.log(formattedAreaString, formattedCircumferenceString);
}

// Execute the main processing function to start the application.
processGeometricCalculations();