// This is a Type III clone of the original JavaScript code.
// It features extensive renaming of identifiers, reformatting,
// the introduction of helper functions and constants, and structural changes
// such as replacing 'eval' with explicit operations and adding error handling.
// The core logic of processing words from standard input and performing
// a specific string-to-number subtraction remains functionally equivalent.

// Define constants for configuration parameters, enhancing readability and maintainability.
const STANDARD_INPUT_SOURCE = "/dev/stdin";
const FILE_CONTENT_ENCODING = "utf8";
const INITIAL_WORD_OFFSET = 1; // The original code starts processing from the second word (index 1).

/**
 * Processes a given input string by sorting its characters,
 * then generating two specific string representations based on in-place array reversals.
 * This helper function encapsulates the character manipulation logic.
 *
 * @param {string} inputSegment - The string segment (word) to be processed.
 * @returns {object} An object containing two string properties:
 *   - 'firstReversal': The string formed by reversing the sorted character array once.
 *   - 'secondReversal': The string formed by reversing the array a second time (restoring original sorted order).
 */
function deriveReversedAndSortedForms(inputSegment) {
    // Implement a guard clause for invalid or empty input to ensure robustness.
    if (typeof inputSegment !== 'string' || inputSegment.length === 0) {
        // Return empty strings for consistent type, preventing errors in subsequent numerical operations.
        return { firstReversal: "", secondReversal: "" };
    }

    // Convert the word into an array of characters and sort it alphabetically.
    // The `sort()` method modifies the array in place.
    const characterSequence = inputSegment.split('');
    characterSequence.sort(); // Example: "banana" -> ['a', 'a', 'a', 'b', 'n', 'n']

    // Capture the state after the first in-place reversal.
    // This modifies 'characterSequence' to be reversed ('n', 'n', 'b', 'a', 'a', 'a').
    const stringAfterFirstReversal = characterSequence.reverse().join('');

    // Capture the state after the second in-place reversal.
    // This modifies 'characterSequence' back to its original sorted order ('a', 'a', 'a', 'b', 'n', 'n').
    const stringAfterSecondReversal = characterSequence.reverse().join('');

    // Return both derived strings.
    return {
        firstReversal: stringAfterFirstReversal,
        secondReversal: stringAfterSecondReversal
    };
}

// Main execution block to handle file reading and word processing.
try {
    // Read the entire content from the specified standard input path.
    const rawContentBuffer = require("fs").readFileSync(STANDARD_INPUT_SOURCE, FILE_CONTENT_ENCODING);

    // Split the content into individual word components using any whitespace character(s) as a delimiter.
    // Using `/\s+/` ensures that multiple spaces or newlines are treated as a single delimiter.
    const wordComponents = rawContentBuffer.split(/\s+/);

    let currentProcessingIndex = INITIAL_WORD_OFFSET; // Initialize the loop's current index.

    // Iterate through the collected word components, starting from the defined offset.
    // The loop continues as long as there are valid components to process.
    while (currentProcessingIndex < wordComponents.length) {
        const currentWordForProcessing = wordComponents[currentProcessingIndex];

        // Increment the index for the next iteration immediately after retrieving the current word.
        currentProcessingIndex++;

        // Introduce a guard clause: Skip any empty or whitespace-only word components
        // that might result from splitting, improving robustness.
        if (!currentWordForProcessing || currentWordForProcessing.trim().length === 0) {
            continue; // Proceed to the next word component.
        }

        // Apply the character manipulation logic to the current word.
        const derivedStringForms = deriveReversedAndSortedForms(currentWordForProcessing);

        // Perform the numerical subtraction. JavaScript's type coercion will attempt
        // to convert the strings to numbers before subtracting.
        // This operation replicates the exact behavior of `eval(r+'-'+r)` from the original code,
        // which was `(reversed_sorted_string) - (original_sorted_string)`.
        const computedDifference = derivedStringForms.firstReversal - derivedStringForms.secondReversal;

        // Output the final result to the console.
        console.log(computedDifference);
    }
} catch (fileReadError) {
    // Implement robust error handling for file system operations.
    // Log a descriptive error message if reading from /dev/stdin fails.
    console.error(`An error occurred while attempting to read from ${STANDARD_INPUT_SOURCE}: ${fileReadError.message}`);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}