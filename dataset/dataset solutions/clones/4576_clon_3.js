/**
 * Expert-generated Type III code clone.
 * This variant processes a string containing three space-separated numeric values
 * to ascertain if the middle value falls inclusively within the range defined
 * by the first and third values.
 *
 * Extensive modifications include:
 * - Renaming of all identifiers.
 * - Rewriting of input parsing logic to be more granular and include validation.
 * - Introduction of helper variables and functions.
 * - Addition of guard clauses and error handling.
 * - Changes in control flow and intermediate result storage.
 * - Comprehensive commenting to describe new structures and logic.
 */
function EvaluateNumericRange(inputDataString) {
    // Variable to hold the final determination, initialized to a negative outcome.
    let finalVerdict = 'No';

    // A small helper function to abstract the core range checking logic.
    // This adds a layer of indirection and improves readability for the main condition.
    const checkValueBounds = (candidateValue, lowerLimit, upperLimit) => {
        // Ensure the candidate is not less than the lower bound AND not greater than the upper bound.
        return candidateValue >= lowerLimit && candidateValue <= upperLimit;
    };

    // Step 1: Validate the raw input string.
    // An empty or whitespace-only string cannot be processed.
    if (!inputDataString || inputDataString.trim().length === 0) {
        console.error("Operation Aborted: The provided input string is empty or contains only whitespace.");
        return; // Terminate execution if input is invalid.
    }

    // Step 2: Split the input string into its constituent parts.
    // Using trim() ensures leading/trailing spaces don't create empty array elements.
    const delimitedFragments = inputDataString.trim().split(' ');

    // Define the expected count of numeric parameters.
    const requiredParameterCount = 3;

    // Step 3: Validate the number of fragments.
    // We need exactly three numbers: lower bound, test value, upper bound.
    if (delimitedFragments.length < requiredParameterCount) {
        console.error(`Operation Aborted: Insufficient numeric parameters. Expected ${requiredParameterCount}, but received ${delimitedFragments.length}.`);
        return;
    }

    // Step 4: Parse the string fragments into actual numbers with robust validation.
    const numericParameters = [];
    for (let i = 0; i < requiredParameterCount; i++) {
        const currentFragment = delimitedFragments[i];
        const numericConversion = Number(currentFragment); // Using Number() for parsing.

        // Check if the conversion resulted in a valid number.
        if (isNaN(numericConversion)) {
            console.error(`Operation Aborted: Input fragment "${currentFragment}" is not a valid numerical value.`);
            return; // Exit if any fragment is non-numeric.
        }
        numericParameters.push(numericConversion);
    }

    // Step 5: Assign the parsed numbers to clearly named variables.
    // Renaming A, B, C to more descriptive terms.
    const lowerBoundary = numericParameters[0]; // The starting point of the range.
    const valueToTest = numericParameters[1];   // The number whose position we are checking.
    const upperBoundary = numericParameters[2]; // The ending point of the range.

    // Step 6: Evaluate the core condition using the helper function.
    // Store the boolean result in an intermediate variable for clarity.
    const isValueWithinSpecifiedRange = checkValueBounds(valueToTest, lowerBoundary, upperBoundary);

    // Step 7: Based on the evaluation, update the final verdict message.
    if (isValueWithinSpecifiedRange) {
        finalVerdict = 'Yes'; // Only change to 'Yes' if the condition is met.
    }
    // If not, it remains 'No' as per its initialization.

    // Step 8: Output the final result to the standard console.
    console.log(finalVerdict);
}

// --- Program Entry Point and Input Handling ---
// This section is responsible for reading the input from the system's standard input stream.
// Using a different variable name for the 'fs' module and encapsulating in a try-catch for robustness.
const systemIOHandler = require('fs');
const standardInputFilePath = '/dev/stdin';

try {
    // Attempt to synchronously read the content of the standard input file.
    // The 'utf8' encoding ensures the input is treated as text.
    const acquiredInputContent = systemIOHandler.readFileSync(standardInputFilePath, 'utf8');

    // Call the main processing function with the content read from stdin.
    EvaluateNumericRange(acquiredInputContent);

} catch (fileReadError) {
    // If any error occurs during the file reading process, log it to stderr.
    console.error(`An exception occurred while attempting to read from ${standardInputFilePath}:`, fileReadError.message);
}