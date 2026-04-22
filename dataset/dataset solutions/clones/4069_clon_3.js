const fileSystemHandler = require("fs"); // Import the file system module for input operations.

// Define the standard input file path, typically where the program receives its data.
const standardInputFilePath = "/dev/stdin";

/**
 * Assesses if a non-negative integer is a perfect square.
 * This function encapsulates the core logic, enhancing modularity.
 *
 * @param {number} candidateValue The integer to be checked.
 * @returns {string} "Affirmative" if the number is a perfect square, otherwise "Negative".
 */
function determinePerfectSquareStatus(candidateValue) {
    // Extensive input validation as a Type III addition.
    // Checks for non-numeric, non-finite, or negative values that cannot be perfect squares in the real integer domain.
    if (typeof candidateValue !== 'number' || !Number.isFinite(candidateValue)) {
        // If the input is not a valid finite number, it cannot be a perfect square.
        return "Negative";
    }

    if (candidateValue < 0) {
        // Negative numbers do not possess real integer square roots.
        return "Negative";
    }

    // Compute the principal square root of the candidate value.
    const calculatedRootResult = Math.sqrt(candidateValue);

    // Verify if the calculated root is an integer.
    // This uses the modulo operator (Type III rewrite) instead of Number.isInteger for equivalence.
    const isRootAnExactInteger = (calculatedRootResult % 1 === 0);

    // Formulate the appropriate response message based on the evaluation.
    let finalResponseMessage;
    if (isRootAnExactInteger) {
        finalResponseMessage = "Affirmative"; // If the root is an integer.
    } else {
        finalResponseMessage = "Negative";    // If the root is not an integer.
    }

    return finalResponseMessage;
}

// Main execution block, wrapped in a try-catch for robust error handling (Type III addition).
try {
    // Retrieve the raw content from the standard input stream.
    // The encoding is specified for correct string interpretation.
    const rawDataBuffer = fileSystemHandler.readFileSync(standardInputFilePath, { encoding: "utf8" });

    // Pre-process the raw input string.
    // 1. Remove leading and trailing whitespace characters.
    const cleanedAndTrimmedInput = rawDataBuffer.trim();

    // 2. Remove only the *first* whitespace character encountered after trimming.
    // This precisely replicates the original code's `replace(/\s/, "")` behavior on the trimmed string,
    // ensuring functional equivalence for parsing behavior (e.g., "1 2 3" becomes "12 3" then parseInt(12)).
    const stringForNumericConversion = cleanedAndTrimmedInput.replace(/\s/, "");

    // Convert the pre-processed string into a base-10 integer.
    // `parseInt` is used directly, maintaining the original parsing mechanism.
    let parsedNumericInput = parseInt(stringForNumericConversion, 10);

    // Additional validation for the parsed number (Type III guard clause).
    // Check if the parsing resulted in a non-numeric value or an infinite number.
    if (Number.isNaN(parsedNumericInput) || !Number.isFinite(parsedNumericInput)) {
        // If the input cannot be properly parsed into a finite number, it's not a perfect square.
        console.log("Negative");
    } else {
        // If the input is a valid finite number, proceed to determine its perfect square status.
        const judgmentResult = determinePerfectSquareStatus(parsedNumericInput);
        // Display the final outcome to the console.
        console.log(judgmentResult);
    }

} catch (operationalError) {
    // Capture and report any exceptions that occur during file reading or processing.
    // This expanded error handling is a Type III addition.
    console.error("An unexpected error occurred during program execution:");
    console.error(`Error Message: ${operationalError.message}`);
    // In case of an error, it's safe to assume the input wasn't processed successfully.
    console.log("Negative");
}