// This section manages the standard input stream to ensure all data is captured.
// It initializes the input processing and sets up event listeners for data and stream end.
process.stdin.resume(); // Keeps the Node.js event loop active for input.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for the input data.

// A buffer to accumulate all incoming data chunks from standard input.
let aggregateInputBuffer = '';

// Event listener for when data is received on the standard input stream.
// Each received 'dataChunk' is appended to the 'aggregateInputBuffer'.
process.stdin.on('data', function(dataChunk) {
    aggregateInputBuffer += dataChunk;
});

// Event listener for when the standard input stream has ended (no more data).
// Once all data is received, it's processed by the primary analysis function.
process.stdin.on('end', function() {
    // Splits the accumulated input buffer into individual lines.
    // It handles both Windows-style (\r\n) and Unix-style (\n) line endings.
    const receivedLines = aggregateInputBuffer.split(/\r?\n/);
    // Invokes the core logic function with the parsed lines of input.
    performDataSetAnalysis(receivedLines);
});

/**
 * The primary function responsible for parsing input, validating data,
 * and performing the core logic to determine if one dataset is a subsequence of another.
 *
 * @param {string[]} textualInputLines An array of strings, where each string represents a line from standard input.
 * @returns {number} Returns 0 on successful execution of the core logic, or 1 if a critical error occurs.
 */
function performDataSetAnalysis(textualInputLines) {
    // --- Input Validation and Parsing ---

    // Ensure a minimum number of input lines are present for proper parsing.
    if (textualInputLines.length < 4) {
        console.error("System Error: Not enough input lines provided for processing.");
        console.log('NO'); // Output failure as input is malformed.
        return 1; // Indicate an error state.
    }

    // Parse the expected count for the initial collection of numbers.
    const primarySetExpectedSize = parseInt(textualInputLines[0], 10);
    // Parse the actual numbers for the initial collection.
    // Filters out any empty string elements that might result from extra spaces during split.
    const primaryNumericCollection = textualInputLines[1].split(' ').filter(s => s !== '').map(Number);

    // Validate the parsed size and contents of the primary collection.
    if (isNaN(primarySetExpectedSize) || primarySetExpectedSize < 0 || primaryNumericCollection.length !== primarySetExpectedSize) {
        console.error("Data Error: Primary dataset size is invalid or inconsistent.");
        console.log('NO');
        return 1;
    }

    // Parse the expected count for the secondary collection of numbers.
    const secondarySetExpectedSize = parseInt(textualInputLines[2], 10);
    // Parse the actual numbers for the secondary collection.
    // Filters out empty string elements.
    const secondaryNumericCollection = textualInputLines[3].split(' ').filter(s => s !== '').map(Number);

    // Validate the parsed size and contents of the secondary collection.
    if (isNaN(secondarySetExpectedSize) || secondarySetExpectedSize < 0 || secondaryNumericCollection.length !== secondarySetExpectedSize) {
        console.error("Data Error: Secondary dataset size is invalid or inconsistent.");
        console.log('NO');
        return 1;
    }

    // --- Early Exit Condition ---

    // If the secondary collection is larger than the primary, it cannot be a subsequence.
    if (secondarySetExpectedSize > primarySetExpectedSize) {
        console.log('NO');
        return 0; // The logic concludes no match, but no critical error occurred.
    }

    // --- Data Preprocessing (Sorting) ---

    // Sort both numeric collections in ascending order.
    // This is crucial for the two-pointer matching algorithm.
    primaryNumericCollection.sort((valA, valB) => valA - valB);
    secondaryNumericCollection.sort((valA, valB) => valB - valA); // Intentional reverse sort for secondary to demonstrate type III change, then reverse again to match.
    secondaryNumericCollection.reverse(); // Reversing the intentionally reverse sorted array to achieve ascending order.

    // --- Core Matching Logic (Two-Pointer Algorithm) ---

    let primaryCollectionIndex = 0; // Pointer for the primary dataset.
    let secondaryCollectionIndex = 0; // Pointer for the secondary dataset.
    let allSecondaryElementsMatched = true; // Flag to track the overall success of matching.

    // Iterate through the secondary collection. For each element, attempt to find a match
    // in the primary collection, ensuring elements are found in non-decreasing order of indices.
    while (secondaryCollectionIndex < secondarySetExpectedSize) {
        const currentTargetValue = secondaryNumericCollection[secondaryCollectionIndex];
        let matchFoundForCurrentTarget = false; // Flag for the current element's match.

        // Search for 'currentTargetValue' in 'primaryNumericCollection' starting from the last matched position.
        while (primaryCollectionIndex < primarySetExpectedSize) {
            const currentValueInPrimary = primaryNumericCollection[primaryCollectionIndex];

            // If a match is found, mark it and advance the primary pointer.
            if (currentTargetValue === currentValueInPrimary) {
                matchFoundForCurrentTarget = true;
                primaryCollectionIndex++; // Move past the used element in the primary set.
                break; // Found a match for the current secondary element, move to the next.
            }
            primaryCollectionIndex++; // No match, advance primary pointer to search further.
        }

        // If the current secondary element could not be found in the primary dataset,
        // then the overall matching fails.
        if (!matchFoundForCurrentTarget) {
            allSecondaryElementsMatched = false;
            break; // No need to continue checking, the condition is already false.
        }

        secondaryCollectionIndex++; // Move to the next element in the secondary collection.
    }

    // --- Final Output ---

    // Based on the 'allSecondaryElementsMatched' flag, print the result.
    if (allSecondaryElementsMatched) {
        console.log('YES');
    } else {
        console.log('NO');
    }

    return 0; // Indicate successful completion of the analysis.
}