// This module defines a function for evaluating a specific numeric condition based on input data.

/**
 * Processes a raw string input to extract numerical values,
 * performs a modular arithmetic operation, and then evaluates a condition
 * to output 'Yes' or 'No'. This function handles basic input validation.
 *
 * @param {string} rawInputContent - The complete input string, typically from stdin.
 */
function evaluateNumericCondition(rawInputContent) {
    // Step 1: Normalize the input string.
    // Remove any leading/trailing whitespace from the entire input.
    const sanitizedInput = rawInputContent.trim();

    // Split the cleaned input into individual lines.
    const inputLines = sanitizedInput.split('\n');

    // Step 2: Parse numerical components from the lines.
    // Initialize an array to store successfully parsed integers.
    const parsedNumericalValues = [];

    // Iterate through each line to convert it to an integer.
    // Add a validation step for each conversion.
    for (const currentLineText of inputLines) {
        // Attempt to parse the current line as a base-10 integer.
        const numericalCandidate = parseInt(currentLineText, 10);

        // Guard clause: Check if the parsing was successful and resulted in a valid number.
        if (!isNaN(numericalCandidate)) {
            parsedNumericalValues.push(numericalCandidate);
        } else {
            // Optional: Log a warning for malformed input lines, but continue processing.
            // console.warn(`Skipping non-numeric input line: "${currentLineText}"`);
        }
    }

    // Step 3: Validate the quantity of essential numerical data.
    // The core logic requires at least two valid numbers.
    const MINIMUM_REQUIRED_VALUES = 2;
    if (parsedNumericalValues.length < MINIMUM_REQUIRED_VALUES) {
        console.log('No'); // Not enough data to perform the check.
        // An alternative would be to throw an error or log a specific message.
        return; // Terminate execution as prerequisite data is missing.
    }

    // Step 4: Extract the primary operands for the computation.
    const primarySourceValue = parsedNumericalValues[0];
    const comparisonReference = parsedNumericalValues[1];

    // Define the constant divisor for the modular operation.
    const MODULAR_CONSTANT = 500; // This value is fixed for the calculation.

    // Step 5: Perform the modular arithmetic calculation.
    // Calculate the remainder of the primary value when divided by the constant.
    const computedRemainder = primarySourceValue % MODULAR_CONSTANT;

    // Step 6: Evaluate the final condition and produce the output.
    // The condition is: is the computed remainder less than or equal to the comparison reference?
    let finalOutcome;
    if (computedRemainder <= comparisonReference) {
        finalOutcome = 'Yes'; // Condition holds true.
    } else {
        finalOutcome = 'No';  // Condition is false.
    }

    // Output the determined outcome to the console.
    console.log(finalOutcome);
}

// --- Application Entry Point ---
// This section handles reading the input from the standard input stream
// and passing it to the main processing function.

const fileSystemUtility = require("fs"); // Import the Node.js file system module.
const standardInputPath = "/dev/stdin"; // Standard path for input on POSIX systems.

try {
    // Read the entire content of the standard input file synchronously.
    // Specify 'utf8' encoding for text interpretation.
    const applicationInputString = fileSystemUtility.readFileSync(standardInputPath, "utf8");

    // Invoke the main processing function with the obtained input.
    evaluateNumericCondition(applicationInputString);

} catch (inputReadError) {
    // Catch any errors that occur during the file reading process.
    console.error("Error encountered while attempting to read standard input:", inputReadError.message);
    // As a robust fallback, if input cannot be read, output 'No'.
    console.log('No');
}