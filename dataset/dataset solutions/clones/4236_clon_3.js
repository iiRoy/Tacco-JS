// This module encapsulates a specific mathematical computation routine.
// Its primary function is to interpret numerical parameters from standard input
// and then calculate a derived integer value based on a predefined formula.

/**
 * Safely converts an array of string tokens into an array of integer numbers.
 * Any token that cannot be parsed as a valid integer will default to 0.
 *
 * @param {string[]} stringTokenArray - An array of strings, each expected to represent a number.
 * @returns {number[]} An array containing the parsed integer values.
 */
function convertTokensToIntegers(stringTokenArray) {
    // Create a mutable list to hold our numeric results.
    const integerCollection = [];

    // Iterate through each string element provided in the input array.
    for (const currentStringToken of stringTokenArray) {
        // Attempt to parse the string into a base-10 integer, after trimming whitespace.
        const conversionAttempt = parseInt(currentStringToken.trim(), 10);

        // Check if the result of parseInt is not a number (NaN).
        if (isNaN(conversionAttempt)) {
            // If parsing fails, push a default value (0) and potentially log a warning.
            // console.warn(`Warning: Encountered non-numeric input "${currentStringToken}". Defaulting to 0.`);
            integerCollection.push(0);
        } else {
            // If parsing is successful, add the valid integer to our collection.
            integerCollection.push(conversionAttempt);
        }
    }
    // Return the array of processed integer values.
    return integerCollection;
}

/**
 * The core function that processes raw text input, extracts numerical operands,
 * and computes the final result using the formula Math.floor((X - Z) / (Z + Y)).
 *
 * @param {string} rawSourceText - The complete raw string content, usually from a file or stdin.
 */
function computeNumericExpression(rawSourceText) {
    // --- Input Validation Phase ---
    // Validate the incoming raw text: ensure it's a non-empty string.
    if (!rawSourceText || typeof rawSourceText !== 'string' || rawSourceText.length === 0) {
        console.error("Execution Aborted: Input text is either missing, not a string, or empty.");
        return; // Halt execution early for invalid input.
    }

    // Clean and segment the input text into distinct lines.
    // .trim() removes leading/trailing whitespace from the entire block.
    // .split('\n') breaks it into an array of lines.
    // .filter(...) removes any lines that are entirely whitespace or empty after trimming.
    const meaningfulLines = rawSourceText.trim().split('\n').filter(line => line.trim().length > 0);

    // Ensure there's at least one line of actual data to process.
    if (meaningfulLines.length === 0) {
        console.error("Execution Aborted: No valid data lines found in the provided input.");
        return;
    }

    // We are interested in the very first line of meaningful data.
    const primaryDataLine = meaningfulLines[0];

    // Split this primary line by spaces to get the individual string representations of numbers.
    const operandStringTokens = primaryDataLine.split(' ');

    // --- Operand Extraction Phase ---
    // Use the helper function to convert string tokens into actual numbers.
    // Destructure the resulting array into distinct variables for clarity.
    // This assumes the helper returns at least 3 elements, defaulting to 0 if not enough.
    const [firstTerm, secondTerm, thirdTerm] = convertTokensToIntegers(operandStringTokens);

    // Further validation: ensure we actually obtained enough distinct numeric values.
    if (operandStringTokens.length < 3) {
        console.error(`Execution Aborted: Insufficient numeric operands found. Expected 3, but received ${operandStringTokens.length} tokens.`);
        return;
    }

    // --- Calculation Phase ---
    // Calculate the numerator of our expression: (X - Z)
    const expressionNumerator = firstTerm - thirdTerm;

    // Calculate the denominator of our expression: (Z + Y)
    const expressionDenominator = thirdTerm + secondTerm;

    // Critical guard: prevent division by zero, which would result in Infinity or NaN.
    if (expressionDenominator === 0) {
        console.warn("Warning: Division by zero condition detected (Z + Y resulted in 0). Outputting 0 as a safe default.");
        console.log(0); // Output a predefined default value for this exceptional case.
        return;
    }

    // Perform the division.
    const rawDivisionResult = expressionNumerator / expressionDenominator;

    // Apply the Math.floor function to get the largest integer less than or equal to the result.
    const finalCalculatedValue = Math.floor(rawDivisionResult);

    // --- Output Phase ---
    // Print the final computed integer value to standard output.
    // Using a template literal for robust string conversion.
    console.log(`${finalCalculatedValue}`);
}

// --- Application Entry Point ---
// This block is responsible for reading input from the system's standard input stream
// and initiating the main computation process. It includes error handling for I/O operations.
try {
    // Lazily load the Node.js file system module.
    const fileSystemModule = require("fs");

    // Read all data from /dev/stdin (standard input) as a UTF-8 encoded string.
    const standardInputStreamContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Invoke our main processing function with the content read from stdin.
    computeNumericExpression(standardInputStreamContent);
} catch (fileReadError) {
    // Catch and report any errors that occur during the file reading process.
    console.error("An input/output error occurred while attempting to read from /dev/stdin:", fileReadError.message);
    // In a production environment, one might also choose to exit the process with an error code.
    // process.exit(1);
}