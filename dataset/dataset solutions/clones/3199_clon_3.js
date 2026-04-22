/*
 * This JavaScript module provides a utility function to evaluate a specific numerical condition.
 * It is designed to accept a single string as input, which is expected to contain two
 * space-separated integer values. The primary objective is to process these values
 * according to a predefined mathematical rule and output a "YES" or "NO" response.
 *
 * This version represents a Type III code clone, incorporating significant structural
 * and superficial modifications while preserving the original functional intent.
 * Changes include:
 * - Renaming of all identifiers (variables, functions, parameters).
 * - Extensive comments and reformatting of whitespace.
 * - Introduction of intermediate variables to break down complex expressions.
 * - Addition of robust input validation and error handling mechanisms.
 * - Alternative implementations for string processing and type conversion.
 * - Restructuring of the main execution flow with error handling.
 */

/**
 * Processes a raw input string containing two numbers, evaluates a specific condition
 * based on these numbers, and prints the outcome ("YES" or "NO") to the console.
 * Includes multiple layers of validation to ensure data integrity.
 *
 * @param {string} rawInputPayload - The incoming string data, potentially from a file or stdin.
 *                                   Expected format: "N K" where N and K are integers.
 * @returns {void} - This function does not return a value; it performs a side effect
 *                   by logging to the console.
 */
function assessNumericCondition(rawInputPayload) {
    // Step 1: Pre-process the raw input. Remove any leading/trailing whitespace,
    // including newline characters, to ensure clean parsing.
    const trimmedInputLine = rawInputPayload.trim();

    // Step 2: Divide the cleaned input string into an array of substrings
    // using a space as the delimiter.
    const inputTokenCollection = trimmedInputLine.split(" ");

    // Step 3: Validate the structure of the input. We expect exactly two tokens.
    // If the count is incorrect, log an error and terminate execution early.
    const REQUIRED_TOKEN_COUNT = 2;
    if (inputTokenCollection.length !== REQUIRED_TOKEN_COUNT) {
        console.error("Input malformation detected: Expected two numeric tokens, but received", inputTokenCollection.length);
        return; // Halt further processing for invalid input structure.
    }

    // Step 4: Extract the individual string tokens from the collection.
    const firstStringToken = inputTokenCollection[0];
    const secondStringToken = inputTokenCollection[1];

    // Step 5: Convert the string tokens into their integer representations.
    // Using parseInt with a radix (10) is crucial for reliable base-10 conversion.
    const primaryValue = parseInt(firstStringToken, 10);
    const secondaryValue = parseInt(secondStringToken, 10);

    // Step 6: Perform a data type validation check. Ensure both parsed values
    // are actual numbers and not NaN (Not-a-Number), which can result from
    // unsuccessful parseInt operations.
    if (isNaN(primaryValue) || isNaN(secondaryValue)) {
        console.error("Parsing error: One or both input tokens could not be converted to valid integers.");
        return; // Abort if numeric conversion failed.
    }

    // Step 7: Introduce intermediate variables to decompose the original mathematical
    // expression `n + 1 - (k * 2) >= 0`. This improves clarity and maintainability.
    // Calculate the 'left-hand side' component of the comparison.
    const incrementedPrimary = primaryValue + 1; // Corresponds to `n + 1`

    // Calculate the 'right-hand side' component of the comparison.
    const doubledSecondary = secondaryValue * 2; // Corresponds to `k * 2`

    // Step 8: Evaluate the core condition. The original condition can be rephrased as
    // `(n + 1) >= (k * 2)`. We will store the boolean result in a flag.
    let conditionEvaluationResult = false; // Default assumption is that the condition is not met.

    // Calculate the difference to check against zero, which is equivalent to the original logic.
    const netDifference = incrementedPrimary - doubledSecondary;

    if (netDifference >= 0) {
        conditionEvaluationResult = true; // Set the flag if the condition holds true.
    }

    // Step 9: Prepare the final textual output based on the condition's evaluation.
    let finalResponseText;
    if (conditionEvaluationResult) {
        finalResponseText = "YES";
    } else {
        finalResponseText = "NO";
    }

    // Step 10: Display the determined response to the standard output.
    console.log(finalResponseText);
}

// --- Program Entry Point and Execution Handling ---

// This block handles reading input from /dev/stdin and invoking the main logic.
// It's wrapped in a try-catch block for robust error management during file operations.
try {
    // Dynamically import the 'fs' (file system) module, typical for Node.js environments.
    const nodeFileSystem = require('fs');

    // Synchronously read the entire content of standard input as a UTF-8 string.
    const standardInputBuffer = nodeFileSystem.readFileSync('/dev/stdin', 'utf8');

    // Invoke the primary function with the data obtained from standard input.
    assessNumericCondition(standardInputBuffer);

} catch (runtimeException) {
    // If any error occurs during file reading or during the execution of the main function,
    // catch it here and log a descriptive error message.
    console.error("An operational fault occurred during program execution:", runtimeException.message);
    // Optionally, exit the process with an error code to signal failure to the operating system.
    // process.exit(1);
}