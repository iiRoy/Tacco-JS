/*
 * This JavaScript module is designed to compute and display various
 * geometric properties of a circular shape. It expects a single numerical
 * input representing the radius of the circle, which it reads from
 * the standard input stream. The module then calculates and outputs
 * the circle's area and its perimeter (circumference).
 *
 * This implementation includes robust input validation and error handling
 * to ensure that only valid, positive numeric values are processed.
 */

/**
 * Calculates and outputs the area and circumference of a circle.
 * Expects a string input which should represent a positive numeric radius.
 *
 * @param {string} rawRadiusData The raw string data read from input,
 *                                potentially containing whitespace.
 * @returns {void} This function prints output directly to the console.
 */
const performGeometricMeasurements = function(rawRadiusData) {
    // Step 1: Pre-process the incoming string data.
    // Remove any leading or trailing whitespace characters to ensure clean parsing.
    const cleanedInputString = rawRadiusData.trim();

    // Step 2: Convert the cleaned string into a floating-point number.
    // This allows for decimal radii, providing more flexibility.
    const circleRadius = parseFloat(cleanedInputString);

    // Step 3: Input Validation - a crucial added fragment for robustness.
    // Check if the parsed value is a valid number and if it's positive.
    // A radius must be a real, positive number for a meaningful circle.
    if (isNaN(circleRadius) || circleRadius <= 0) {
        console.error("Error: The provided input is not a valid positive number for a radius.");
        console.error(`Received: '${cleanedInputString}'. Please input a value like '5' or '3.14'.`);
        // Exit the function early if validation fails, preventing further erroneous calculations.
        return;
    }

    // Step 4: Define mathematical constants and intermediate values.
    // Using a constant for PI improves readability and maintains consistency.
    const PI_CONSTANT = Math.PI;

    // Calculate the square of the radius. This is an alternative to Math.pow(r, 2).
    const radiusSquared = circleRadius * circleRadius;

    // Step 5: Perform the core geometric calculations.
    // Calculate the area using the formula: Area = PI * r^2
    const calculatedAreaValue = PI_CONSTANT * radiusSquared;

    // Calculate the circumference (perimeter) using the formula: Circumference = 2 * PI * r
    const calculatedCircumferenceValue = 2 * PI_CONSTANT * circleRadius;

    // Step 6: Format and present the results.
    // Use a template literal for a multi-line, descriptive output string.
    // Rounding to a fixed number of decimal places for cleaner presentation.
    const resultOutput = `
    ======================================
    Circle Property Analysis:
    --------------------------------------
    Input Radius:        ${circleRadius.toFixed(3)} units
    Calculated Area:     ${calculatedAreaValue.toFixed(4)} square units
    Calculated Perimeter: ${calculatedCircumferenceValue.toFixed(4)} units
    ======================================
    `;

    // Log the formatted results to the console.
    console.log(resultOutput);
};

// This immediately invoked function expression (IIFE) encapsulates the
// main execution logic, ensuring it runs as soon as the script loads.
(function initializeAndExecute() {
    let receivedInputContent = '';
    try {
        // Attempt to read data synchronously from standard input.
        // The '/dev/stdin' path is common on Unix-like systems for standard input.
        // 'utf8' encoding ensures the input is treated as a string of characters.
        receivedInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (fileReadError) {
        // An added guard clause: Handle any errors that occur during file reading.
        // This could be due to missing /dev/stdin, permissions, or other I/O issues.
        console.error(`CRITICAL ERROR: Failed to read from standard input. Details: ${fileReadError.message}`);
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }

    // After successfully acquiring the input, pass it to the primary
    // calculation function for processing and display.
    performGeometricMeasurements(receivedInputContent);

    // Optional: Add a final message to confirm completion, a new fragment.
    // console.log("Operation finished successfully.");
})();