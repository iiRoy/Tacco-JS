/**
 * Processes a string containing space-separated numeric values and performs a comparison.
 * This function determines an outcome based on the relative magnitudes of the first two numbers.
 *
 * @param {string} sourceString - The raw string input, expected to contain at least two numbers separated by whitespace.
 */
function ProcessInputData(sourceString) {
    // Validate that the provided input is indeed a string.
    // This acts as an initial guard clause to prevent unexpected errors.
    if (typeof sourceString !== 'string') {
        console.error("Error: The provided input must be a string type.");
        return; // Terminate execution if input is invalid.
    }

    // Normalize the input string by trimming leading/trailing whitespace,
    // then split it into an array of string tokens using one or more whitespace characters as delimiters.
    let stringTokens = sourceString.trim().split(/\s+/);

    // Verify that there are at least two distinct tokens available for numeric parsing.
    // This is a crucial validation step before attempting number conversion.
    if (stringTokens.length < 2) {
        console.error("Error: Insufficient numeric values found in the input string for comparison.");
        return; // Terminate if not enough data.
    }

    // Convert each string token into a numerical value.
    // The `Number()` constructor attempts to convert the string to a number.
    // We then filter out any results that are `NaN` (Not-a-Number), ensuring only valid numbers proceed.
    let parsedNumericValues = stringTokens
        .map(token => Number(token))
        .filter(value => !isNaN(value));

    // After parsing and filtering, re-validate that we still have at least two valid numbers.
    if (parsedNumericValues.length < 2) {
        console.error("Error: Could not successfully parse at least two valid numbers from the provided input.");
        return; // Terminate if parsing failed for essential data.
    }

    // Assign the first two successfully parsed numbers to clearly named variables.
    // This improves readability and makes the comparison intent explicit.
    let primaryValue = parsedNumericValues[0];
    let secondaryValue = parsedNumericValues[1];

    // Evaluate the condition: Is the primary value strictly less than the secondary value?
    // Store the boolean result in an intermediate variable.
    let isPrimaryValueSmaller = (primaryValue < secondaryValue);

    let calculatedResultForOutput; // Declare a variable to hold the final output value.

    // Use a conditional block to assign the appropriate result based on the comparison.
    // This separates the logic of determining the result from the final output action.
    if (isPrimaryValueSmaller) {
        calculatedResultForOutput = 0; // Outcome for when the primary value is indeed smaller.
    } else {
        // This branch covers cases where primaryValue >= secondaryValue.
        calculatedResultForOutput = 10; // Outcome for when the primary value is greater than or equal.
    }

    // Display the final calculated result to the standard output.
    console.log(calculatedResultForOutput);
}

// --- Execution Entry Point ---
// This block handles reading input from the system's standard input and invoking the processing logic.

try {
    // Define the path for standard input, which is common in competitive programming environments.
    const standardInputPath = "/dev/stdin";

    // Dynamically import the Node.js 'fs' (file system) module.
    const fileSystemHandler = require("fs");

    // Read the entire content of the standard input file synchronously.
    // Specify 'utf8' encoding to correctly interpret text data.
    const rawInputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");

    // Call the main processing function with the raw content obtained from standard input.
    ProcessInputData(rawInputContent);

} catch (inputReadingError) {
    // Catch and log any errors that might occur during the file reading process,
    // such as file not found or permission issues.
    console.error("An unexpected error occurred during input acquisition:", inputReadingError.message);
}