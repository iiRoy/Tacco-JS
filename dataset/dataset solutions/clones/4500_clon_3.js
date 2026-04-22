/**
 * Processes raw string input from standard input to rearrange a sequence of numbers.
 * The rearrangement logic depends on whether the total count of numbers is even or odd.
 * This function acts as the primary orchestrator for input handling, validation,
 * data transformation, and final output generation.
 *
 * @param {string} rawInputContent - The complete raw string content read from stdin.
 */
const dataProcessor = (rawInputContent) => {
    // --- Phase 1: Input Validation and Initial Parsing ---

    // Guard clause: Ensure the provided input is a non-empty string.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Error: The input provided is either not a string or is completely empty.");
        // Terminate execution as valid input is crucial.
        return;
    }

    // Clean up the entire input string (remove leading/trailing whitespace) and then
    // divide it into individual lines based on newline characters.
    const inputLines = rawInputContent.trim().split('\n');

    // Guard clause: Verify that we have at least two distinct lines of input.
    // The first line typically contains the count, and the second line contains the numbers.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines for processing.");
        return;
    }

    // Attempt to parse the first line as the total expected count of elements.
    // Using Number.parseInt with an explicit radix (10) for robust integer conversion.
    const totalElementsCount = Number.parseInt(inputLines[0], 10);

    // Guard clause: Validate that the parsed element count is a positive integer.
    // Checks for NaN, non-positive values, and non-integer values.
    if (isNaN(totalElementsCount) || totalElementsCount <= 0 || !Number.isInteger(totalElementsCount)) {
        console.error(`Error: The declared element count is invalid or non-positive: '${inputLines[0]}'.`);
        return;
    }

    // Parse the second line to extract the array of initial numerical values.
    // - `split(/\s+/)`: Splits the string by one or more whitespace characters, handling multiple spaces.
    // - `filter(Boolean)`: Removes any empty strings that might result from the split (e.g., if there's leading/trailing space or multiple spaces).
    // - `map(valueString => Number.parseInt(valueString, 10))`: Converts each filtered string segment into an integer.
    const sourceNumericalArray = inputLines[1].split(/\s+/).filter(Boolean).map(valueString => Number.parseInt(valueString, 10));

    // Guard clause: Perform a crucial cross-validation. The actual number of values parsed
    // from the second line must match the `totalElementsCount` declared in the first line.
    if (sourceNumericalArray.length !== totalElementsCount) {
        console.error(`Error: Mismatch found! Declared element count was ${totalElementsCount}, but parsed ${sourceNumericalArray.length} values.`);
        return;
    }

    // --- Phase 2: Core Logic for Sequence Rearrangement ---

    // Introduce a boolean flag for clarity when checking the parity of the total count.
    const isTotalCountEven = (totalElementsCount % 2 === 0);

    // Initialize two intermediate arrays. These will hold the two distinct segments
    // of the reordered sequence before they are combined. This enhances readability
    // and modularity of the rearrangement logic.
    let leadingSequenceSegment = [];
    let trailingSequenceSegment = [];

    // Conditional logic based on the parity of `totalElementsCount`.
    if (isTotalCountEven) {
        // Case: The total number of elements is an even number.

        // Sub-phase 2.1: Populate `leadingSequenceSegment`.
        // Iterate backwards from the second-to-last element (index `N-1`) down to `1`,
        // decrementing the index by 2 in each step. This collects elements at odd indices
        // in reverse order (e.g., N-1, N-3, ..., 1).
        for (let currentElementIndex = totalElementsCount - 1; currentElementIndex >= 1; currentElementIndex -= 2) {
            leadingSequenceSegment.push(sourceNumericalArray[currentElementIndex]);
        }

        // Sub-phase 2.2: Populate `trailingSequenceSegment`.
        // Iterate forwards from the first element (index `0`) up to `N-2`,
        // incrementing the index by 2 in each step. This collects elements at even indices
        // in forward order (e.g., 0, 2, ..., N-2).
        for (let currentElementIndex = 0; currentElementIndex < totalElementsCount; currentElementIndex += 2) {
            trailingSequenceSegment.push(sourceNumericalArray[currentElementIndex]);
        }
    } else {
        // Case: The total number of elements is an odd number.

        // Sub-phase 2.1: Populate `leadingSequenceSegment`.
        // Iterate backwards from the last element (index `N-1`) down to `0`,
        // decrementing the index by 2 in each step. This collects elements at alternating indices
        // in reverse order (e.g., N-1, N-3, ..., 0).
        for (let currentElementIndex = totalElementsCount - 1; currentElementIndex >= 0; currentElementIndex -= 2) {
            leadingSequenceSegment.push(sourceNumericalArray[currentElementIndex]);
        }

        // Sub-phase 2.2: Populate `trailingSequenceSegment`.
        // Iterate forwards from the second element (index `1`) up to `N-2`,
        // incrementing the index by 2 in each step. This collects elements at alternating indices
        // in forward order (e.g., 1, 3, ..., N-2).
        for (let currentElementIndex = 1; currentElementIndex < totalElementsCount; currentElementIndex += 2) {
            trailingSequenceSegment.push(sourceNumericalArray[currentElementIndex]);
        }
    }

    // Combine the two generated segments into the final, reordered sequence.
    // The `concat` method creates a new array without modifying the original segments.
    const finalReorderedSequence = leadingSequenceSegment.concat(trailingSequenceSegment);

    // --- Phase 3: Output Generation ---

    // Convert the final array of numbers into a single string, with elements
    // separated by a single space. Utilize a template literal for output.
    console.log(`${finalReorderedSequence.join(' ')}`);
};

// --- Entry Point for Script Execution ---

// This block handles reading the input from standard input (`/dev/stdin`)
// and invoking the main processing function. It includes error handling
// for potential file system I/O issues.
try {
    // Read the entire content of `/dev/stdin` as a UTF-8 encoded string.
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Call the primary data processing function with the retrieved content.
    dataProcessor(fileContent);
} catch (fileReadError) {
    // If any error occurs during file reading (e.g., file not found, permission denied),
    // log an informative error message to the console.
    console.error(`An I/O error was encountered while attempting to read from stdin: ${fileReadError.message}`);
}