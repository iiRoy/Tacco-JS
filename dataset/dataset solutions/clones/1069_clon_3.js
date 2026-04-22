// A global buffer to accumulate all standard input data received in chunks.
let accumulatedRawData = '';

/**
 * Helper function to safely swap two elements within an array.
 * This introduces a new code fragment and simplifies the swap logic within the partition.
 * @param {Array<number>} collection - The array where elements need to be swapped.
 * @param {number} idxA - The index of the first element.
 * @param {number} idxB - The index of the second element.
 */
const swapElements = (collection, idxA, idxB) => {
    // Basic validation to prevent out-of-bounds access, though the calling function should ensure valid indices.
    if (idxA < 0 || idxB < 0 || idxA >= collection.length || idxB >= collection.length) {
        // In a production environment, one might throw an error or log a warning.
        // For this clone, we just prevent the operation.
        return;
    }
    // Perform the swap using a temporary variable for clarity.
    // This is an alternative to destructuring assignment `[collection[idxA], collection[idxB]] = [collection[idxB], collection[idxA]];`
    let temporaryValue = collection[idxA];
    collection[idxA] = collection[idxB];
    collection[idxB] = temporaryValue;
};

/**
 * Implements the Lomuto partition scheme for QuickSort.
 * It selects the last element as the pivot, rearranges the subarray
 * such that elements smaller than or equal to the pivot are on its left,
 * and elements greater than the pivot are on its right.
 * The array is modified in-place.
 * @param {Array<number>} dataCollection - The array of numbers to be partitioned.
 * @param {number} lowerBound - The starting index of the subarray to be partitioned.
 * @param {number} upperBound - The ending index of the subarray to be partitioned.
 * @returns {number} The final index of the pivot element after partitioning, or -1 if bounds are invalid.
 */
const performLomutoPartition = (dataCollection, lowerBound, upperBound) => {
    // Guard clause: Validate the input bounds to prevent errors.
    if (lowerBound > upperBound || lowerBound < 0 || upperBound >= dataCollection.length) {
        console.error("Error: Invalid bounds provided for partition operation.");
        return -1; // Indicate an error or an invalid partition.
    }

    // Choose the pivot element. In Lomuto scheme, it's typically the last element.
    const pivotElementValue = dataCollection[upperBound];
    // `smallerElementsBoundary` tracks the boundary between elements less than/equal to pivot
    // and elements greater than pivot. It starts one position before the lower bound.
    let smallerElementsBoundary = lowerBound - 1;

    // Iterate through the subarray from the lowerBound up to (but not including) the upperBound (pivot).
    for (let currentElementIndex = lowerBound; currentElementIndex < upperBound; ++currentElementIndex) {
        // If the current element is less than or equal to the pivot value,
        // it should be moved to the left side of the partition.
        if (dataCollection[currentElementIndex] <= pivotElementValue) {
            // Increment the boundary for smaller elements.
            smallerElementsBoundary += 1;
            // Swap the current element with the element at `smallerElementsBoundary`.
            // This places the smaller element into its correct section.
            // Add a check to avoid unnecessary self-swaps.
            if (currentElementIndex !== smallerElementsBoundary) {
                swapElements(dataCollection, smallerElementsBoundary, currentElementIndex);
            }
        }
    }

    // After the loop, `smallerElementsBoundary + 1` is the correct position for the pivot element.
    const finalPivotIndex = smallerElementsBoundary + 1;
    // Swap the pivot element (currently at `upperBound`) with the element at `finalPivotIndex`.
    // This places the pivot in its sorted position within the subarray.
    // Add a check to avoid unnecessary self-swaps if the pivot is already in place.
    if (upperBound !== finalPivotIndex) {
        swapElements(dataCollection, finalPivotIndex, upperBound);
    }

    // Return the index of the pivot element after it has been placed.
    return finalPivotIndex;
};

/**
 * Main function responsible for orchestrating the partitioning process
 * and displaying the result in a specific format, highlighting the pivot.
 * @param {Array<number>} numericSequence - The array of numbers to process.
 */
const executePartitionAndDisplay = (numericSequence) => {
    // Guard clauses for edge cases: empty or single-element arrays.
    if (!Array.isArray(numericSequence) || numericSequence.length === 0) {
        console.log("Input sequence is empty or invalid. No partitioning performed.");
        return; // Exit early.
    }
    if (numericSequence.length === 1) {
        // For a single-element array, that element is inherently the pivot.
        console.log(`[${numericSequence[0]}]`);
        return; // Exit early.
    }

    // Define the range for the partition operation.
    const subArrayStartIndex = 0;
    const subArrayEndIndex = numericSequence.length - 1;

    // Perform the Lomuto partition. The array is modified in-place.
    // The function returns the final index of the pivot element.
    const pivotFinalPosition = performLomutoPartition(numericSequence, subArrayStartIndex, subArrayEndIndex);

    // If the partition function indicated an error (e.g., -1 return), then exit.
    if (pivotFinalPosition === -1) {
        console.error("Partition operation failed due to invalid parameters.");
        return;
    }

    // Build the output string by iterating through the modified array.
    // The element at `pivotFinalPosition` will be enclosed in square brackets.
    let outputStringSegments = [];
    for (let currentElementIndex = 0; currentElementIndex < numericSequence.length; ++currentElementIndex) {
        const currentNumericalValue = numericSequence[currentElementIndex];
        if (currentElementIndex === pivotFinalPosition) {
            outputStringSegments.push(`[${currentNumericalValue}]`);
        } else {
            outputStringSegments.push(String(currentNumericalValue)); // Ensure all parts are strings.
        }
    }

    // Join all segments with a space and print the final result.
    const finalFormattedOutput = outputStringSegments.join(' ');
    console.log(finalFormattedOutput);
};

// Event listener for incoming data from standard input.
// This accumulates data chunks into `accumulatedRawData`.
process.stdin.on('data', (incomingDataChunk) => {
    // Ensure the incoming chunk is converted to a string before concatenation.
    // This adds robustness against different types of data chunks (e.g., Buffer).
    if (typeof incomingDataChunk === 'object' && incomingDataChunk instanceof Buffer) {
        accumulatedRawData += incomingDataChunk.toString('utf8');
    } else if (typeof incomingDataChunk === 'string') {
        accumulatedRawData += incomingDataChunk;
    }
    // No logging here to keep output clean, but could add for debugging.
});

// Event listener for the 'end' signal from standard input.
// This indicates that all input has been received and processing can begin.
process.stdin.on('end', () => {
    // 1. Clean up the accumulated raw data: remove trailing whitespace from the entire input.
    let processedInputBuffer = accumulatedRawData.trimEnd();

    // 2. Split the input into individual lines and clean trailing whitespace from each line.
    let parsedInputLines = processedInputBuffer.split('\n').map(singleLine => singleLine.trimEnd());

    // 3. Validate input: Ensure there are enough lines for the problem's expected format.
    // Assuming the problem expects at least two lines (first line for count, second for numbers).
    if (parsedInputLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        process.exit(1); // Exit with an error code.
    }

    // 4. Extract the second line (index 1) which contains the space-separated numbers.
    // Filter out any empty strings that might result from multiple spaces between numbers.
    let numericStringTokens = parsedInputLines[1].split(' ').filter(token => token !== '');

    // 5. Convert each string token to a number. Include error handling for non-numeric inputs.
    let finalNumericArray = numericStringTokens.map(token => {
        const convertedNumber = Number(token);
        if (isNaN(convertedNumber)) {
            console.error(`Error: Non-numeric value found in input: '${token}'. Exiting.`);
            process.exit(1); // Exit with an error code.
        }
        return convertedNumber;
    });

    // 6. Invoke the primary processing function with the prepared array of numbers.
    executePartitionAndDisplay(finalNumericArray);
});