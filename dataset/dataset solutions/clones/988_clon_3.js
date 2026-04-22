// This module is responsible for orchestrating the numerical sorting process.
// It retrieves input data from standard input, parses it, then applies an
// in-place sorting algorithm while displaying intermediate array states.

// Ensures that the standard input stream remains active and ready to receive data.
process.stdin.resume();
// Configures the input stream to interpret all incoming bytes as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

/**
 * Initiates the primary sequence of operations: input parsing, validation, and sorting.
 * This function acts as the entry point for the application's core logic.
 * @param {string} rawInputContent - The complete string content read from the standard input.
 */
function manageDataStreamAndSort (rawInputContent) {
    // Prepare the input string: remove any peripheral whitespace and separate into distinct lines.
    let processedLines = rawInputContent.trim().split('\n');

    // --- Input Validation Phase 1: Structural Integrity ---
    // A minimum of two lines is expected: one for count, one for numbers.
    if (processedLines.length < 2) {
        console.error("Program Termination: Insufficient input lines detected. Expected at least two lines.");
        return; // Exit if the basic structure is not met.
    }

    // Extract the declared number of elements from the first line.
    // Use `parseInt` with a radix for robust integer conversion.
    const declaredElementCount = parseInt(processedLines[0].trim(), 10);

    // Parse the second line, splitting it by spaces and converting each segment to a number.
    let numericalCollection = processedLines[1].trim().split(' ').map(Number);

    // --- Input Validation Phase 2: Data Consistency ---
    // Verify that the declared count is a valid positive integer.
    if (isNaN(declaredElementCount) || declaredElementCount < 0) {
        console.error("Program Termination: Invalid or negative element count provided in the first line.");
        return;
    }
    // Cross-check if the actual number of parsed elements matches the declared count.
    if (numericalCollection.length !== declaredElementCount) {
        console.error(`Program Termination: Mismatch between declared element count (${declaredElementCount}) and actual elements (${numericalCollection.length}).`);
        return; // Discrepancy indicates invalid input for the problem.
    }

    /**
     * A utility function to output the current arrangement of the array to the console.
     * Elements are joined by a single space, replicating the problem's output format.
     * @param {number[]} currentArrayState - The array whose state is to be displayed.
     */
    const presentArraySnapshot = (currentArrayState) => {
        console.log(currentArrayState.join(' '));
    };

    // Determine the effective number of items for the sorting loop.
    const actualItemQuantity = numericalCollection.length;

    // --- Early Exit Condition for Trivial Cases ---
    // If there's zero or one element, the array is inherently sorted.
    if (actualItemQuantity <= 1) {
        presentArraySnapshot(numericalCollection); // Display it once.
        return;
    }

    // --- Implementation of an Incremental Sort (Insertion Sort Variant) ---
    // The outer loop iterates through the array starting from the second element.
    // Each iteration focuses on inserting the element at `currentWorkingIndex`
    // into its correct position within the already sorted sub-array to its left.
    for (let currentWorkingIndex = 1; currentWorkingIndex < actualItemQuantity; ++currentWorkingIndex) {
        // As per problem requirements, display the array's state *before*
        // the current element is processed and inserted.
        presentArraySnapshot(numericalCollection);

        // Store the value of the element that needs to be positioned correctly.
        let valueToRelocate = numericalCollection[currentWorkingIndex];

        // Initialize an index for traversing the sorted portion of the array (to the left).
        let comparisonPointer = currentWorkingIndex - 1;

        // The inner loop shifts elements to the right as long as they are
        // greater than `valueToRelocate` and we haven't reached the beginning of the array.
        while (comparisonPointer >= 0 && numericalCollection[comparisonPointer] > valueToRelocate) {
            // Shift the larger element one position to the right.
            numericalCollection[comparisonPointer + 1] = numericalCollection[comparisonPointer];
            // Move the comparison pointer one step left.
            comparisonPointer--;
        }

        // After the shifting, place `valueToRelocate` into its definitive sorted spot.
        // `comparisonPointer + 1` marks the position where `valueToRelocate` belongs.
        numericalCollection[comparisonPointer + 1] = valueToRelocate;
    }

    // --- Final Output ---
    // Once the entire sorting procedure is complete, display the fully sorted array.
    presentArraySnapshot(numericalCollection);
}

// Synchronously read the entire content from standard input (typically '/dev/stdin' in judge systems)
// and then pass this raw string data to the main processing function.
manageDataStreamAndSort(require('fs').readFileSync('/dev/stdin', 'utf8'));