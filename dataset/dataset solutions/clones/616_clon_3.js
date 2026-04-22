const fileSystemModule = require('fs');

// --- Configuration Constants ---
// Path to the standard input file. In competitive programming, this is typically '/dev/stdin'.
const STDIN_FILE_PATH = '/dev/stdin';
// The fixed number of initial data lines to process for combinations.
// The original code used a hardcoded '5' for its loops, implying it always processes the first 5 available lines after 'n'.
const NUM_DATA_LINES_TO_PROCESS = 5;
// The zero-based index of the element to retrieve from the sorted list of sums.
const DESIRED_SORTED_ELEMENT_INDEX = 2;

/**
 * Executes the main logic: reads input, generates number combinations, sorts them,
 * and prints a specific element from the sorted list.
 * Includes robust error handling and input validation.
 */
function executeCombinationProcessing() {
    let rawInputBuffer;

    // Attempt to read the entire content of the input file synchronously.
    try {
        rawInputBuffer = fileSystemModule.readFileSync(STDIN_FILE_PATH, 'utf8');
    } catch (fileReadError) {
        // Log an error if the file cannot be read and terminate.
        console.error("Critical Error: Unable to read from standard input file.", fileReadError.message);
        return; // Exit function on critical error.
    }

    // Validate if any content was actually read.
    if (!rawInputBuffer || rawInputBuffer.trim().length === 0) {
        console.warn("Warning: Input stream appears to be empty or contains only whitespace.");
        return; // Exit if no meaningful input.
    }

    // Process the raw string input:
    // 1. Trim leading/trailing whitespace from the entire input.
    // 2. Split the string into an array of lines, handling both Unix (\n) and Windows (\r\n) newlines.
    // 3. Filter out any resulting empty strings, which can occur if there are multiple consecutive newlines.
    const relevantInputLines = rawInputBuffer
                                .trim()
                                .split(/\r?\n/)
                                .filter(lineContent => lineContent.length > 0); // Ensure lines are not empty

    // The original code would remove the first line as 'n' but then ignore 'n' and use Arr[0]..Arr[4].
    // By removing 'n' entirely (a Type III deletion), we directly work with the data lines.
    // Therefore, we must ensure enough lines are present for the hardcoded loop bounds.
    if (relevantInputLines.length < NUM_DATA_LINES_TO_PROCESS) {
        console.error(`Error: Insufficient data lines for processing. Expected at least ${NUM_DATA_LINES_TO_PROCESS}, but received ${relevantInputLines.length}.`);
        return; // Exit if not enough data.
    }

    // Initialize an array to store all the generated sums.
    const collectionOfCombinedSums = [];

    // Outer loop iterates through the first 'NUM_DATA_LINES_TO_PROCESS' elements.
    for (let outerLoopIndex = 0; outerLoopIndex < NUM_DATA_LINES_TO_PROCESS; outerLoopIndex++) {
        // Inner loop starts from the element *after* the current outerLoopIndex
        // to ensure unique pairs and avoid self-pairing.
        for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < NUM_DATA_LINES_TO_PROCESS; innerLoopIndex++) {

            // Retrieve the string representations of the numbers for the current pair.
            const firstOperandString = relevantInputLines[outerLoopIndex];
            const secondOperandString = relevantInputLines[innerLoopIndex];

            // Create the first combination: concatenate string A then string B, then convert to a number.
            const combinedValueOne = Number(firstOperandString + secondOperandString);
            collectionOfCombinedSums.push(combinedValueOne);

            // Create the second combination: concatenate string B then string A, then convert to a number.
            const combinedValueTwo = Number(secondOperandString + firstOperandString);
            collectionOfCombinedSums.push(combinedValueTwo);
        }
    }

    // Sort the array of combined sums numerically in ascending order.
    // The custom comparison function (a, b) => a - b is crucial for numerical sorting.
    collectionOfCombinedSums.sort((valueA, valueB) => valueA - valueB);

    // Final validation: Ensure the desired index is within the bounds of the sorted array.
    if (collectionOfCombinedSums.length <= DESIRED_SORTED_ELEMENT_INDEX) {
        console.error(`Error: The sorted list has ${collectionOfCombinedSums.length} elements, which is not enough to retrieve element at index ${DESIRED_SORTED_ELEMENT_INDEX}.`);
        return; // Exit if the target element doesn't exist.
    }

    // Output the element at the specified index from the sorted list.
    console.log(collectionOfCombinedSums[DESIRED_SORTED_ELEMENT_INDEX]);
}

// Invoke the main processing function to start the application.
executeCombinationProcessing();