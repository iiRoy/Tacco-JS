// This script analyzes a text stream to determine the inclusive span length
// between the first occurrence of a 'start' character and the last occurrence
// of an 'end' character. It's designed for command-line execution with
// input provided via standard input.

/**
 * Calculates the inclusive length of a segment within a string, defined by
 * the first occurrence of a specified start character and the last occurrence
 * of a specified end character.
 *
 * @param {string} inputData The string content to be analyzed.
 * @returns {number} The calculated segment length. Returns 0 if input is invalid,
 *                   markers are not found, or the start marker appears after the end marker.
 */
function calculateInclusiveCharacterSpan(inputData) {
    // Perform initial validation on the provided input string.
    // Ensures the data is a valid string and not empty, crucial for string operations.
    if (typeof inputData !== 'string' || inputData.trim().length === 0) {
        console.error("Error: Input data is not a valid non-empty string for span analysis.");
        return 0; // Indicate an invalid input state.
    }

    // Define the specific characters that delineate the desired segment.
    const firstBoundaryChar = "A"; // The character marking the beginning of the segment.
    const lastBoundaryChar = "Z";  // The character marking the end of the segment.

    // Helper function to find the first index of a character.
    const retrieveFirstIndex = (textSource, targetChar) => textSource.indexOf(targetChar);

    // Helper function to find the last index of a character.
    const retrieveLastIndex = (textSource, targetChar) => textSource.lastIndexOf(targetChar);

    // Determine the index of the first occurrence of the start character.
    let startIndex = retrieveFirstIndex(inputData, firstBoundaryChar);

    // Determine the index of the last occurrence of the end character.
    let endIndex = retrieveLastIndex(inputData, lastBoundaryChar);

    // Implement robust checks to ensure both boundary characters were successfully located.
    // If either character is not found (index is -1), a meaningful span cannot be calculated.
    if (startIndex === -1 || endIndex === -1) {
        console.warn(`Warning: One or both boundary characters ('${firstBoundaryChar}', '${lastBoundaryChar}') were not found in the input. Cannot determine a valid span.`);
        return 0; // Return 0 to signify that no valid span was found.
    }

    // Additional validation: Ensure the start character logically precedes or is at
    // the same position as the end character. If 'A' appears after 'Z', the range is inverted.
    if (startIndex > endIndex) {
        console.warn(`Warning: The starting character '${firstBoundaryChar}' was found after the ending character '${lastBoundaryChar}'. Invalid logical span.`);
        return 0; // Return 0 for an inverted or illogical span.
    }

    // Calculate the length of the segment. The formula (endIndex - startIndex + 1)
    // ensures an inclusive count of characters from startIndex to endIndex.
    // This can be rewritten as (endIndex + 1) - startIndex for alternative arithmetic.
    let calculatedLength = (endIndex + 1) - startIndex;

    // Return the final computed length of the character span.
    return calculatedLength;
}

// Access the Node.js built-in file system module for reading input.
const fileStreamOperations = require("fs");

// Define the standard path for receiving input in typical Unix-like environments.
const standardInputDevicePath = "/dev/stdin";

// Main execution pathway of the script.
try {
    // Read the raw byte content from the standard input path.
    // This step is explicit about reading as a buffer first.
    const rawInputBuffer = fileStreamOperations.readFileSync(standardInputDevicePath);

    // Convert the raw buffer data into a UTF-8 encoded string.
    // This is an explicit conversion step, enhancing clarity.
    const processedContentString = rawInputBuffer.toString('utf8');

    // Invoke the span calculation function with the obtained string data.
    const finalSpanResult = calculateInclusiveCharacterSpan(processedContentString);

    // Output the computed result to the standard output stream.
    // Using console.log is a common and convenient way to output results in JavaScript,
    // automatically appending a newline.
    console.log(finalSpanResult);

} catch (runtimeError) {
    // Catch and handle any errors that occur during file reading or processing.
    // Provides a user-friendly error message.
    console.error("An unrecoverable error occurred during program execution:", runtimeError.message);
    // Exit the process with a non-zero status code to indicate an abnormal termination.
    process.exit(1);
}