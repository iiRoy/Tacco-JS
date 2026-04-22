// This module processes a given string to generate an abbreviated form
// following a specific pattern: first character + middle segment length + last character.

/**
 * Generates and displays a compact abbreviation for an input text string.
 * This function handles input validation and ensures the abbreviation logic is applied.
 * @param {string} rawTextInput - The original string provided for abbreviation.
 */
function processAndDisplayAbbreviation(rawTextInput) {
    // Defensive programming: Validate the input to ensure it's a string and not empty.
    // If the input is invalid or missing, a default message is logged, and processing halts.
    if (typeof rawTextInput !== 'string' || rawTextInput.length === 0) {
        console.log("Input string is invalid or empty. Cannot generate abbreviation.");
        return; // Terminate execution for invalid input
    }

    // Perform trimming once and store the result for consistency and efficiency.
    const processedInputString = rawTextInput.trim();

    // If trimming results in an empty string, handle this specific case.
    if (processedInputString.length === 0) {
        console.log("Input string became empty after trimming. Cannot generate abbreviation.");
        return;
    }

    // Capture the effective length of the string after trimming whitespace.
    // This intermediate variable helps in avoiding redundant calculations.
    const effectiveStringLength = processedInputString.length;

    // Extract the very first character of the processed input string.
    // Using charAt() is a robust way to get characters at specific indices.
    const initialCharacter = processedInputString.charAt(0);

    // Determine the character at the very end of the processed input string.
    const finalCharacter = processedInputString.charAt(effectiveStringLength - 1);

    // Calculate the numeric value representing the length of the string's middle part.
    // This value can be zero or negative if the string is very short (length < 2),
    // maintaining the original algorithm's behavior for such edge cases.
    const computedMiddleLength = effectiveStringLength - 2;

    // Construct the final abbreviated identifier using template literals for clarity.
    // This combines the first character, the calculated middle length, and the last character.
    const generatedAbbreviation = `${initialCharacter}${computedMiddleLength}${finalCharacter}`;

    // Output the resulting abbreviation to the console.
    // This is the primary output action of the function.
    console.log(generatedAbbreviation);
}

// --- Main execution block to read from standard input and invoke the processing function ---

// Utilize a try-catch block to manage potential errors during file system operations,
// enhancing the robustness of the script.
try {
    // Explicitly require the 'fs' (file system) module for input reading.
    const fileSystemAccess = require("fs");

    // Define the standard input path as a constant for better readability and maintainability.
    const standardInputSource = "/dev/stdin";

    // Specify the character encoding for reading the input file.
    const inputEncodingScheme = "utf8";

    // Synchronously read all content from the standard input.
    // The content is expected to be a string based on the encoding.
    const contentFromStandardInput = fileSystemAccess.readFileSync(standardInputSource, inputEncodingScheme);

    // Pass the retrieved content to the abbreviation processing function.
    // The .trim() method is applied to remove any leading/trailing whitespace
    // that might be present in the input stream, ensuring cleaner processing.
    processAndDisplayAbbreviation(contentFromStandardInput);

} catch (executionError) {
    // If any error occurs during the input reading or processing phase,
    // log an informative error message to the console.
    console.error("An unexpected error occurred during script execution:", executionError.message);
    // As a fallback or error indicator, a specific message can be passed to the processing function.
    // This demonstrates handling failure states gracefully.
    processAndDisplayAbbreviation("[ERROR]"); // Provide a default/error string for processing
}