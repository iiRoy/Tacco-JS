// This JavaScript module computes the circumference of a circle.
// It reads the radius value from a designated standard input file path.

/**
 * Configuration constants for file system operations and mathematical values.
 */
const INPUT_SOURCE_PATH = '/dev/stdin';      // Specifies the file path to read input from.
const READ_FILE_ENCODING = 'utf8';          // Defines the character encoding for file reading.
const MATHEMATICAL_PI_VALUE = Math.PI;      // Stores the standard Pi constant for calculations.
const CIRCUMFERENCE_MULTIPLIER = 2;         // The constant factor '2' in the circumference formula (2 * Pi * R).

/**
 * Retrieves the core 'fs' (file system) module required for file operations.
 * This is a fundamental Node.js built-in module.
 */
const fileSystemHandler = require('fs');

/**
 * Parses a given string into an integer radius value.
 * Includes robust validation to ensure the input is a valid number.
 *
 * @param {string} rawStringData - The raw string input that needs to be parsed.
 * @returns {number} The parsed integer radius, or 0 if parsing fails or input is invalid.
 */
function parseAndValidateRadius(rawStringData) {
    // Sanitize the input by removing leading/trailing whitespace.
    const cleanedInput = rawStringData.trim();

    // Attempt to parse the cleaned string into an integer.
    // Using parseInt(..., 10) explicitly specifies base 10 for reliability.
    const candidateRadius = parseInt(cleanedInput, 10);

    // Perform validation:
    // 1. Check if the parsing resulted in a 'Not a Number' (NaN).
    // 2. Check if the number is finite (prevents Infinity or -Infinity from malformed strings).
    if (isNaN(candidateRadius) || !Number.isFinite(candidateRadius)) {
        // Log an error message if the input is not a valid integer.
        console.error(`Validation Error: Provided input '${cleanedInput}' is not a valid integer for radius. Defaulting to 0.`);
        // Return a default safe value (0) to allow the program to continue gracefully.
        return 0;
    }

    // Return the successfully parsed and validated integer radius.
    return candidateRadius;
}

/**
 * Main execution block of the script.
 * Encapsulates the file reading, parsing, calculation, and output logic.
 */
try {
    // Step 1: Read the raw content from the specified input file.
    // This operation is synchronous and will block until the file is fully read.
    const fileBufferContent = fileSystemHandler.readFileSync(INPUT_SOURCE_PATH, READ_FILE_ENCODING);

    // Step 2: Convert the buffer content to a string and then parse it into a numeric radius.
    // The .toString() call is often redundant if readFileSync is given an encoding,
    // but explicitly ensures string type for the parser function.
    const currentRadiusValue = parseAndValidateRadius(fileBufferContent.toString());

    // Step 3: Check if the radius obtained is valid (not 0 due to an error, unless input was '0').
    // If the radius is 0 and the original input wasn't "0" (meaning an error occurred during parsing),
    // we can decide to exit or continue. For this example, we continue, but the circumference will be 0.
    if (currentRadiusValue === 0 && fileBufferContent.toString().trim() !== '0') {
        console.warn("Processing with a radius of 0 due to invalid input. Circumference will be 0.");
    }

    // Step 4: Calculate the circle's circumference using the well-known formula.
    // C = 2 * Pi * R
    const finalCircumferenceResult = currentRadiusValue * MATHEMATICAL_PI_VALUE * CIRCUMFERENCE_MULTIPLIER;

    // Step 5: Display the calculated circumference in a user-friendly format.
    // Utilizes a template literal for clear output.
    console.log(`Calculated Circumference (for radius ${currentRadiusValue}): ${finalCircumferenceResult}`);

} catch (operationError) {
    // Catch any exceptions that might occur during file reading or other synchronous operations.
    // This provides robustness against issues like file not found or permission errors.
    console.error(`An critical error prevented calculation: ${operationError.message}`);
    // In case of a critical error, it's often good practice to exit with a non-zero status code.
    process.exit(1);
}

// End of circumference calculation script.