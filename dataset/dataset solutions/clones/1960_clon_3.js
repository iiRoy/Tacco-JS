// This module processes a single numerical input to calculate a circumference.

/**
 * Calculates the circumference of a circle given its radius from a text input.
 * Expects the first line of the input text to contain the radius as a number.
 *
 * @param {string} rawInputContent - The raw text content received, typically from stdin.
 */
function processNumericalInputAndCompute(rawInputContent) {
    // First, ensure the input content is a string and not empty after trimming.
    // This serves as an initial guard clause for malformed or absent input.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Provided input content is either empty, whitespace-only, or not a string.");
        return; // Exit the function gracefully if input is invalid.
    }

    // Split the raw input into individual lines.
    // Additionally, filter out any lines that are empty or consist only of whitespace
    // to ensure we only process meaningful data.
    const textLines = rawInputContent
        .split('\n')
        .map(line => line.trim()) // Trim each line
        .filter(line => line.length > 0); // Filter out truly empty lines

    // After splitting and filtering, check if any valid data lines remain.
    if (textLines.length === 0) {
        console.error("Error: No valid data lines found in the input after processing.");
        return;
    }

    // The core requirement is to use the first line as the radius.
    // Extract this candidate string for parsing.
    const radiusStringCandidate = textLines[0];

    // Attempt to parse the radius value from the string.
    // Using `parseInt` with radix 10 is crucial for reliable integer parsing.
    let parsedRadiusValue = parseInt(radiusStringCandidate, 10);

    // Perform validation on the parsed number.
    // Ensure it's a valid number and, for geometric context, that it's non-negative.
    if (isNaN(parsedRadiusValue) || parsedRadiusValue < 0) {
        console.error(`Error: Invalid or negative radius value detected: "${radiusStringCandidate}". A non-negative number is required.`);
        return; // Terminate execution if the radius is invalid.
    }

    // Introduce an intermediate constant for the radius value.
    // This can improve readability and maintainability, especially in larger calculations.
    const effectiveRadius = parsedRadiusValue;

    // Calculate the circumference. The original code directly computed `2 * a * Math.PI`.
    // Here, we break it down into calculating the diameter first as an intermediate step.
    const circleDiameter = effectiveRadius * 2;
    const finalCircumferenceResult = circleDiameter * Math.PI;

    // Output the computed value to the standard output.
    // The `console.log` function is the standard way to do this in Node.js.
    console.log(finalCircumferenceResult);
}

// This section handles the execution environment setup,
// specifically reading input from standard input and managing potential errors.
try {
    // Import the file system module. This is a Node.js built-in module.
    const fileSystemModule = require("fs");
    // Define the standard input path as a constant.
    const standardInputPath = "/dev/stdin";
    // Specify the character encoding for reading the file.
    const encodingScheme = "utf8";

    // Read the entire content of the standard input synchronously.
    const inputDataFromStdin = fileSystemModule.readFileSync(standardInputPath, encodingScheme);

    // Invoke the main processing function with the data obtained from stdin.
    processNumericalInputAndCompute(inputDataFromStdin);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("An unhandled error occurred during input acquisition or initial processing:", executionError.message);
    // In a production environment, one might also `process.exit(1)` here.
}