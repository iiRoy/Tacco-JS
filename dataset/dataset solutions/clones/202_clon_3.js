const fileSystemUtility = require('fs');

// Define distinct constant identifiers for the elements involved in the string transformation.
const PRIMARY_SEARCH_TERM = 'peach'; // The initial string to be temporarily masked.
const SECONDARY_SEARCH_TERM = 'apple'; // The string that will replace the primary search term.
const INTERMEDIATE_MARKER = '__UNIQUE_PLACEHOLDER_FOR_SWAP__'; // A unique token to prevent collision during the swap.

/**
 * Orchestrates the reading of data from standard input,
 * performs a specific two-way string swap (e.g., 'peach' <=> 'apple'),
 * and returns the modified content.
 *
 * This function encapsulates the entire workflow:
 * 1. Data acquisition.
 * 2. Pre-processing (trimming).
 * 3. The multi-step string replacement logic.
 *
 * @returns {string} The final text string after all transformations have been applied.
 */
function executeContentTransformation() {
    let sourceDataBuffer;
    try {
        // Attempt to read the entire content from the standard input path.
        // The 'utf8' encoding ensures correct interpretation of text data.
        sourceDataBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    } catch (acquisitionError) {
        // Log an error if file reading fails, indicating an issue with input availability or permissions.
        console.error("Failed to acquire input data from /dev/stdin:", acquisitionError.message);
        // Return an empty string to prevent further processing on invalid data.
        return "";
    }

    // Convert the buffer to a string and remove any leading or trailing whitespace characters.
    let currentWorkingText = String(sourceDataBuffer).trim();

    // Implement a conditional check: if the text is empty after trimming,
    // no further processing is required, and an empty string can be returned immediately.
    if (currentWorkingText.length === 0) {
        // console.warn("Input text is empty after trimming. No transformation performed."); // Optional debug message.
        return "";
    }

    // --- Begin the multi-stage string replacement process to swap two terms ---

    // Stage 1: Replace all occurrences of the PRIMARY_SEARCH_TERM with the INTERMEDIATE_MARKER.
    // This step temporarily hides the first term to allow the second term to be replaced without conflict.
    let textAfterFirstPass = currentWorkingText.replace(new RegExp(PRIMARY_SEARCH_TERM, 'g'), INTERMEDIATE_MARKER);

    // Stage 2: Replace all occurrences of the SECONDARY_SEARCH_TERM with the PRIMARY_SEARCH_TERM.
    // At this point, all original instances of 'apple' become 'peach'.
    let textAfterSecondPass = textAfterFirstPass.replace(new RegExp(SECONDARY_SEARCH_TERM, 'g'), PRIMARY_SEARCH_TERM);

    // Stage 3: Replace all occurrences of the INTERMEDIATE_MARKER with the SECONDARY_SEARCH_TERM.
    // This finalizes the swap, turning the original 'peach' instances (now marked by the placeholder) into 'apple'.
    let fullyTransformedText = textAfterSecondPass.replace(new RegExp(INTERMEDIATE_MARKER, 'g'), SECONDARY_SEARCH_TERM);

    // The function concludes by returning the completely processed string.
    return fullyTransformedText;
}

// Call the main transformation function and store its result.
const finalOutputContent = executeContentTransformation();

// Display the ultimate result to the standard output.
console.log(finalOutputContent);