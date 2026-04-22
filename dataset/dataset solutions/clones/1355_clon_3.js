// This module processes a string input to determine geometric properties.
// It expects a string containing two space-separated numerical values,
// interpreting them as dimensions for a simple shape.

/**
 * Computes and displays the area and perimeter based on two provided dimensions.
 * The input is expected as a single string with two numbers separated by whitespace.
 *
 * @param {string} rawInputString - The string containing the two numerical dimensions.
 *                                  Example: "10 20"
 * @returns {void} This function outputs the calculated area and perimeter to the console,
 *                 separated by a space. It also handles input validation and error reporting.
 */
function calculateShapeMetrics(rawInputString) {
    // Defensive check: Ensure input is a string.
    if (typeof rawInputString !== 'string') {
        console.error("Input error: The provided data is not a string.");
        return;
    }

    // Normalize and split the input string into potential numerical components.
    // Using a regular expression to handle multiple spaces or leading/trailing spaces.
    const stringComponents = rawInputString.trim().split(/\s+/);

    // Initialize an array to store the successfully parsed finite numbers.
    const processedNumbers = [];

    // Iterate through each component to parse and validate it.
    for (const component of stringComponents) {
        // Attempt to convert the string component into a number.
        // Number() handles both integers and floating-point numbers.
        const numericValue = Number(component);

        // Validate if the parsed value is a valid, finite number.
        // NaN, Infinity, and -Infinity are considered invalid for dimensions.
        if (!Number.isFinite(numericValue)) {
            console.error(`Validation error: '${component}' is not a valid finite number. Please provide two valid numeric dimensions.`);
            return; // Exit early on invalid data.
        }

        // Dimensions should generally be non-negative.
        if (numericValue < 0) {
            console.error(`Validation error: Dimension '${numericValue}' is negative. Dimensions must be non-negative.`);
            return; // Exit early on negative dimension.
        }

        processedNumbers.push(numericValue);
    }

    // Verify that exactly two dimensions were successfully parsed.
    const REQUIRED_DIMENSION_COUNT = 2;
    if (processedNumbers.length !== REQUIRED_DIMENSION_COUNT) {
        console.error(`Input format error: Expected ${REQUIRED_DIMENSION_COUNT} dimensions, but found ${processedNumbers.length}.`);
        return; // Exit if the number of dimensions is incorrect.
    }

    // Assign the two parsed dimensions to descriptive variables for clarity.
    const primaryDimension = processedNumbers[0];
    const secondaryDimension = processedNumbers[1];

    // Perform the area calculation (product of the two dimensions).
    const computedArea = primaryDimension * secondaryDimension;

    // Calculate the sum of the dimensions as an intermediate step for the perimeter.
    const sumOfIndividualDimensions = primaryDimension + secondaryDimension;

    // Perform the perimeter calculation (twice the sum of the two dimensions).
    const computedPerimeter = 2 * sumOfIndividualDimensions;

    // Output the results in the required format: "Area Perimeter".
    // Using template literals for clear and concise string formatting.
    console.log(`${computedArea} ${computedPerimeter}`);
}

// --- Main Program Execution Block ---
// This section is responsible for reading input from the standard input stream
// and passing it to the core processing function.
try {
    // Read the entire content from standard input synchronously.
    // Specify 'utf8' encoding to ensure the input is treated as a string, not a Buffer.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the primary function to process the obtained input.
    calculateShapeMetrics(standardInputContent);
} catch (fileSystemError) {
    // Catch and report any errors that occur during the file reading process.
    // This could include issues like missing /dev/stdin or permission problems.
    console.error(`System input error: Failed to read from standard input. Details: ${fileSystemError.message}`);
}