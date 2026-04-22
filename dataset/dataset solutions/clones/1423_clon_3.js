// This module is designed to ingest a stream of text, process its initial segment,
// and then output a modified version where the case of all English alphabetic
// characters has been inverted. Non-alphabetic characters remain unchanged.

/**
 * Transforms the case of English letters within the first significant line of provided content.
 * Specifically, it converts lowercase letters to uppercase and uppercase letters to lowercase.
 *
 * @param {string} sourceContent - The raw textual input, potentially spanning multiple lines.
 * @returns {string} The processed string with inverted letter cases, or an empty string if input is invalid.
 */
function TransformTextContent(sourceContent) {
    // --- Input Validation and Pre-processing ---
    // A robust check to ensure the input is valid before proceeding.
    if (typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
        console.error("Error: Provided input content is either not a string or is empty/whitespace-only.");
        // Returning an empty string signifies no meaningful output could be generated.
        return "";
    }

    // Split the entire input content into individual lines.
    const allInputLines = sourceContent.split('\n');
    let primaryLineToProcess = ''; // This variable will hold the first non-empty line.

    // Iterate through the lines to find the first one that contains actual text.
    // This is a more explicit way than just `shift()` and handles leading empty lines.
    for (let currentLineSegment of allInputLines) {
        const trimmedSegment = currentLineSegment.trim();
        if (trimmedSegment.length > 0) {
            primaryLineToProcess = trimmedSegment;
            break; // Found the first substantial line, no need to check further.
        }
    }

    // If after checking all lines, no substantial content was found, exit early.
    if (primaryLineToProcess.length === 0) {
        console.warn("Warning: No meaningful text found on any line for transformation after trimming.");
        return "";
    }

    // --- Core Transformation Logic ---
    /**
     * Helper function to invert the case of a single English alphabet character.
     * Non-alphabetic characters are returned as they are.
     *
     * @param {string} characterUnit - A single character string to be processed.
     * @returns {string} The case-inverted character, or the original character if not alphabetic.
     */
    const invertCharacterCase = (characterUnit) => {
        // Obtain the ASCII (or Unicode) numerical value of the character.
        const charCodeValue = characterUnit.charCodeAt(0);

        // Define ASCII ranges for English uppercase and lowercase letters.
        const isUpperCaseAscii = (charCodeValue >= 65 && charCodeValue <= 90); // 'A' through 'Z'
        const isLowerCaseAscii = (charCodeValue >= 97 && charCodeValue <= 122); // 'a' through 'z'

        if (isLowerCaseAscii) {
            // If it's a lowercase letter, convert it to uppercase.
            return characterUnit.toUpperCase();
        } else if (isUpperCaseAscii) {
            // If it's an uppercase letter, convert it to lowercase.
            return characterUnit.toLowerCase();
        } else {
            // If the character is not an English letter, return it without modification.
            return characterUnit;
        }
    };

    // Apply the case inversion helper function to every alphabetic character in the selected line.
    // The regular expression `/[a-zA-Z]/g` matches all English letters, globally.
    const finalTransformedString = primaryLineToProcess.replace(/[a-zA-Z]/g, invertCharacterCase);

    // --- Output and Return ---
    // Display the final result to the standard output stream.
    console.log(finalTransformedString);

    // Return the transformed string for potential further programmatic use.
    return finalTransformedString;
}

// --- Application Execution Entry Point ---
// This block simulates the typical Node.js environment where input is read from /dev/stdin.
const fileSystemAccess = require("fs"); // Import the Node.js File System module.
const standardInputFile = "/dev/stdin"; // Path to the standard input stream.
const textEncodingStandard = "utf8";   // Specify UTF-8 encoding for input data.

try {
    // Attempt to synchronously read all content from the standard input file.
    const rawInputBuffer = fileSystemAccess.readFileSync(standardInputFile, textEncodingStandard);

    // Invoke the main transformation function with the data read from stdin.
    TransformTextContent(rawInputBuffer);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("An unhandled error occurred during script execution:", executionError.message);
    // Indicate a failure to the operating system.
    process.exit(1);
}