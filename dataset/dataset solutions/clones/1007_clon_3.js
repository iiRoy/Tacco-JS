// This module is responsible for capturing standard input, processing it,
// and then applying a sorting algorithm before reporting the results.

// A mutable buffer to accumulate all incoming data chunks from the standard input stream.
let accumulatedInputBuffer = '';

// Attaching an event listener to the standard input stream for 'data' events.
// Each time a chunk of data is received, it's appended to our buffer.
process.stdin.on('data', (incomingDataChunk) => {
    accumulatedInputBuffer += incomingDataChunk;
});

/**
 * A utility function to safely parse a string of space-separated tokens into an array of numbers.
 * It handles potential non-numeric tokens by filtering them out.
 * @param {string} lineContent The string containing space-separated numeric values.
 * @returns {Array<number>} An array of parsed numbers.
 */
const extractNumbersFromString = (lineContent) => {
    // Split the input string by spaces to get individual tokens.
    const rawTokens = lineContent.split(' ');
    const numericValues = []; // Initialize an array to hold valid numbers.

    // Iterate over each token to parse and validate it.
    for (const token of rawTokens) {
        // Attempt to convert the token to a number.
        const parsedNumber = Number(token);
        // Check if the conversion resulted in a valid number (not NaN).
        if (!isNaN(parsedNumber)) {
            numericValues.push(parsedNumber); // Add to our list if valid.
        }
        // Invalid tokens are silently ignored, but could be logged for debugging.
    }
    return numericValues;
};

// Attaching an event listener for the 'end' event of the standard input stream.
// This signifies that all input has been received and can now be processed.
process.stdin.on('end', () => {
    // First, clean up the entire accumulated buffer by trimming leading/trailing whitespace.
    const trimmedFullInput = accumulatedInputBuffer.trim();

    // If the input buffer is empty after trimming, there's nothing to process.
    if (!trimmedFullInput.length) {
        console.error("Input stream ended without providing any data. Exiting.");
        return; // Terminate execution.
    }

    // Split the cleaned input into an array of lines.
    // Each line is also individually trimmed to remove any specific line-ending whitespace.
    const inputLinesCollection = trimmedFullInput.split('\n').map(line => line.trim());

    // Based on typical problem formats, we expect at least two lines:
    // one for metadata (often ignored) and one for the actual data.
    if (inputLinesCollection.length < 2) {
        console.error("Insufficient lines of input detected. Expected at least two.");
        return; // Terminate execution.
    }

    // The actual numeric data sequence is typically found on the second line (index 1).
    const dataSequenceLine = inputLinesCollection[1];

    // Use our helper function to convert the data line into an array of numbers.
    const arrayToSort = extractNumbersFromString(dataSequenceLine);

    // If the extracted array is empty, there's nothing to sort.
    if (arrayToSort.length === 0) {
        console.log(""); // Output an empty line for the "sorted" array.
        console.log("0"); // Output zero swaps.
        return; // Terminate execution.
    }

    // Invoke the sorting routine with the prepared numeric array.
    // This function is responsible for performing the sort and printing the results.
    performSelectionSortAndReport(arrayToSort);
});

/**
 * A private utility to swap two elements within an array.
 * This improves code readability for the sorting algorithm.
 * @param {Array<any>} targetArray The array whose elements are to be swapped.
 * @param {number} firstIndex The index of the first element.
 * @param {number} secondIndex The index of the second element.
 * @returns {boolean} True if the swap was successful, false otherwise (e.g., invalid indices).
 */
const swapArrayElements = (targetArray, firstIndex, secondIndex) => {
    // Basic boundary checks to prevent out-of-bounds access.
    const arrLen = targetArray.length;
    if (firstIndex < 0 || firstIndex >= arrLen || secondIndex < 0 || secondIndex >= arrLen) {
        // Log an error or throw an exception in a more robust system.
        console.warn(`Attempted swap with invalid indices: ${firstIndex}, ${secondIndex} in array of length ${arrLen}`);
        return false;
    }

    // Standard three-step swap using a temporary variable.
    const temporaryValue = targetArray[firstIndex];
    targetArray[firstIndex] = targetArray[secondIndex];
    targetArray[secondIndex] = temporaryValue;
    return true; // Indicate that the swap operation was successful.
};

/**
 * Implements the Selection Sort algorithm for an array of numbers,
 * sorting it in ascending order and counting the total number of swaps (exchanges).
 * The sorted array and the swap count are printed to standard output.
 *
 * @param {Array<number>} mutableNumericArray The array of numbers to be sorted in place.
 * @returns {void} This function does not return a value; it outputs directly.
 */
const performSelectionSortAndReport = (mutableNumericArray) => {
    // Validate the input: ensure it's an array and not empty.
    if (!Array.isArray(mutableNumericArray) || mutableNumericArray.length === 0) {
        console.log(""); // Output empty line for consistency.
        console.log("0"); // Output 0 swaps for empty or invalid input.
        return;
    }

    let exchangeCounter = 0; // Initialize a counter for tracking element swaps.
    const arrayLength = mutableNumericArray.length; // Cache array length for loop efficiency.

    // The outer loop iterates from the first element up to the second-to-last.
    // Each iteration correctly places one element into its sorted position.
    for (let currentOuterPosition = 0; currentOuterPosition < arrayLength - 1; currentOuterPosition++) {
        // Assume the element at the currentOuterPosition is the minimum in the unsorted part.
        let minElementIndex = currentOuterPosition;

        // The inner loop searches for the true minimum element
        // within the remaining unsorted portion of the array.
        for (let innerSearchIterator = currentOuterPosition + 1; innerSearchIterator < arrayLength; innerSearchIterator++) {
            // If a smaller element is found, update the index of the minimum.
            if (mutableNumericArray[innerSearchIterator] < mutableNumericArray[minElementIndex]) {
                minElementIndex = innerSearchIterator;
            }
        }

        // After the inner loop completes, 'minElementIndex' holds the index
        // of the smallest element in the unsorted segment.

        // If the minimum element is not already at the 'currentOuterPosition',
        // perform a swap to place it correctly.
        if (minElementIndex !== currentOuterPosition) {
            // Utilize the helper function for swapping.
            const successfulSwap = swapArrayElements(mutableNumericArray, currentOuterPosition, minElementIndex);
            if (successfulSwap) {
                exchangeCounter++; // Increment counter only if a swap actually occurred.
            }
        }
    }

    // Output the fully sorted array, with elements joined by a space.
    console.log(mutableNumericArray.join(' '));
    // Output the total number of exchanges performed during the sort.
    console.log(exchangeCounter);
};