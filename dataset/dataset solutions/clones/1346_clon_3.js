/**
 * Core utility for geometric computations.
 * This function calculates and displays the area and perimeter of a circle
 * based on a provided string representing its radius. It includes validation
 * and uses explicit intermediate variables for clarity.
 *
 * @param {string} radiusInputString The raw string input expected to contain a numeric radius.
 */
function calculateAndDisplayCircleMetrics(radiusInputString) {
    // Ensure the input is consistently treated as a string and trimmed of whitespace.
    const trimmedNumericString = String(radiusInputString).trim();

    // Guard clause: Check if the input string is empty after trimming.
    if (trimmedNumericString.length === 0) {
        console.error("Error: Input for circle radius cannot be empty. Aborting calculations.");
        return; // Early exit if no meaningful input is provided.
    }

    // Parse the input to a floating-point number for initial flexibility.
    // This allows for non-integer inputs, which are then floored to match original behavior.
    const parsedFloatingRadius = parseFloat(trimmedNumericString);

    // Guard clause: Check for invalid or non-positive numeric input.
    if (isNaN(parsedFloatingRadius) || parsedFloatingRadius <= 0) {
        console.error(`Error: Invalid or non-positive radius value detected: '${radiusInputString}'. Please provide a valid positive number.`);
        return;
    }

    // Explicitly convert the parsed floating-point value to an integer radius.
    // This step aligns with the original `parseInt` behavior, ensuring integer-based calculations.
    const effectiveIntegerRadius = Math.floor(parsedFloatingRadius);

    // Introduce a constant for PI for improved readability and potential future adjustments.
    const UNIVERSAL_PI_VALUE = Math.PI;

    // Calculate the circle's surface area.
    // The calculation is rewritten using `Math.pow` and stored in an intermediate variable.
    const computedSurfaceArea = UNIVERSAL_PI_VALUE * Math.pow(effectiveIntegerRadius, 2);

    // Calculate the circle's circumference (also known as perimeter).
    // The calculation is reordered and stored in an intermediate variable.
    const computedCircumference = 2 * UNIVERSAL_PI_VALUE * effectiveIntegerRadius;

    // Output the results using template literals for enhanced readability and specific labels.
    // The original C-style format string is replaced with a more modern JavaScript approach.
    // Adding `.toFixed(4)` ensures consistent numerical output, mimicking integer-like precision
    // while allowing for potential floating-point results from PI.
    console.log(`Circle Area: ${computedSurfaceArea.toFixed(4)} | Circle Perimeter: ${computedCircumference.toFixed(4)}`);
}

/**
 * Helper function designed to safely acquire content from a specified file path.
 * It encapsulates the file reading logic and error handling.
 *
 * @param {string} sourceFilePath The absolute or relative path to the file to be read.
 * @returns {string|null} The content of the file as a string, or `null` if an error occurred during reading.
 */
function acquireFileContentSafely(sourceFilePath) {
    try {
        // Using 'node:fs' for explicit Node.js module access, a stylistic choice.
        // The encoding is specified in an object literal for clarity.
        const fileContentData = require("node:fs").readFileSync(sourceFilePath, { encoding: "utf8" });
        return fileContentData;
    } catch (fileAccessError) {
        // Log a detailed error message for better debugging and user feedback.
        console.error(`An error occurred while attempting to read the input file '${sourceFilePath}': ${fileAccessError.message}`);
        return null; // Return null to signal a failure in file acquisition to the caller.
    }
}

// Entry point for the application's execution flow.
// Renamed variables and constants related to the input file.
const SOURCE_INPUT_FILE = "b.txt";

// Attempt to retrieve the input data using the dedicated helper function.
const receivedApplicationData = acquireFileContentSafely(SOURCE_INPUT_FILE);

// Conditional execution block: Proceed only if input data was successfully acquired.
if (receivedApplicationData !== null) {
    // If data is available, execute the main logic for processing circle metrics.
    calculateAndDisplayCircleMetrics(receivedApplicationData);
} else {
    // Inform the user if the application cannot proceed due to input file issues.
    console.warn("Application terminated: Unable to process circle metrics due to critical input file errors.");
}