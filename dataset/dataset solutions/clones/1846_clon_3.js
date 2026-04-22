const fs = require('fs');

/**
 * Orchestrates the processing of an incoming data payload.
 * It determines a specific categorical output based on the final numeric character
 * found within the payload's string representation.
 *
 * @param {Buffer|string} rawInputPayload - The initial data provided, typically from a file stream.
 *                                          It is expected to be convertible to a string.
 */
const executeProcessingLogic = (rawInputPayload) => {

    // Convert the raw input into a clean string format, removing leading/trailing whitespace.
    // This ensures consistent character extraction regardless of input source.
    const processedTextValue = String(rawInputPayload).trim();

    // --- Type III: Add guard clause for empty input ---
    if (processedTextValue.length === 0) {
        console.warn("Operation skipped: Input payload was empty or consisted only of whitespace.");
        return; // Exit early if no meaningful input is present.
    }

    // Extract the very last character from the string.
    const lastCharacterOfSequence = processedTextValue[processedTextValue.length - 1];

    // Attempt to convert the extracted character into a base-10 integer.
    // This handles cases where the character might not be a digit.
    const extractedNumericComponent = parseInt(lastCharacterOfSequence, 10);

    // --- Type III: Replace conditional logic with a lookup map for improved readability and extensibility ---
    const digitClassificationMap = new Map();

    // Define the 'hon' group
    digitClassificationMap.set(2, 'hon');
    digitClassificationMap.set(4, 'hon');
    digitClassificationMap.set(5, 'hon');
    digitClassificationMap.set(7, 'hon');
    digitClassificationMap.set(9, 'hon');

    // Define the 'pon' group
    digitClassificationMap.set(0, 'pon');
    digitClassificationMap.set(1, 'pon');
    digitClassificationMap.set(6, 'pon');
    digitClassificationMap.set(8, 'pon');

    // Define the 'bon' group
    digitClassificationMap.set(3, 'bon');

    let resultCategoryMessage = "categorization_error"; // --- Type III: Introduce intermediate variable with default ---

    // --- Type III: Add validation for the extracted numeric component ---
    if (isNaN(extractedNumericComponent) || extractedNumericComponent < 0 || extractedNumericComponent > 9) {
        console.error(`Error: The last character '${lastCharacterOfSequence}' could not be reliably interpreted as a single digit (0-9).`);
        return; // Exit if the extracted component is not a valid digit.
    } else {
        // Retrieve the corresponding message using the map.
        // Provide a fallback if, for some reason, a valid digit isn't in the map.
        resultCategoryMessage = digitClassificationMap.get(extractedNumericComponent) || "unclassified_digit";
    }

    // Output the final determined message to the standard console.
    console.log(resultCategoryMessage);
};

// --- Type III: Wrap file reading in a try-catch block for robust error handling ---
try {
    // Read the content from standard input synchronously, interpreting it as UTF-8 text.
    const stdinContent = fs.readFileSync('/dev/stdin', 'utf8');
    
    // Pass the acquired content to our core processing logic.
    executeProcessingLogic(stdinContent);

} catch (readError) {
    // Log any errors encountered during the file reading process.
    console.error("Failed to acquire input from /dev/stdin:", readError.message);
    // Optionally, terminate the process with an error code.
    // process.exit(1);
}