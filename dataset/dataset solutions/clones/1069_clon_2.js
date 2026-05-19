// This script processes a sequence of numbers provided via standard input.
// It reads the input, parses the second line as an array of numbers,
// then applies a partitioning algorithm to this array,
// and finally prints the modified array with the pivot element highlighted.

let inputBuffer = ''; // Accumulates incoming data from standard input.

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', (incomingDataChunk) => {
    inputBuffer += incomingDataChunk; // Append the chunk to the buffer.
});

// Event listener for 'end' of stdin, indicating all input has been received.
process.stdin.on('end', function() {
    // Clean up the accumulated input:
    // 1. Remove trailing whitespace from the entire buffer.
    // 2. Split the buffer into an array of lines.
    // 3. For each line, remove trailing whitespace.
    inputBuffer = inputBuffer.replace(/\s*$/, '')
        .split('\n')
        .map(lineSegment => lineSegment.replace(/\s*$/, ''));

    // Extract the second line (index 1), split it by spaces,
    // and convert each segment to a number before passing to the processing function.
    processArray(inputBuffer[1].split(' ').map(segment => Number(segment)));
});

/**
 * Processes an array of numeric values by applying a partitioning scheme
 * and then printing the result with the pivot element highlighted.
 * @param {number[]} numericValues - The array of numbers to process.
 */
const processArray = (numericValues) => {
    // Perform the partitioning operation on the array.
    // The 'divideAndConquer' function returns the final index of the pivot element.
    const pivotIndex = divideAndConquer(numericValues, 0, numericValues.length - 1);

    // Output the array, highlighting the element at the pivotIndex.
    console.log(
        numericValues
            .map((currentValue, idx) => {
                // If the current element's index matches the pivot index,
                // enclose it in square brackets; otherwise, convert it to a string.
                return idx === pivotIndex ? `[${currentValue}]` : String(currentValue);
            })
            .join(' ') // Join the processed elements with a space.
    );
};

/**
 * Implements the Lomuto partition scheme for an array.
 * It rearranges elements such that all elements less than or equal to the pivot
 * come before the pivot, and all elements greater than the pivot come after it.
 * The pivot is chosen as the last element of the subarray.
 * @param {number[]} dataCollection - The array to be partitioned.
 * @param {number} startIndex - The starting index of the subarray to partition.
 * @param {number} endIndex - The ending index of the subarray to partition.
 * @returns {number} The final index of the pivot element after partitioning.
 */
const divideAndConquer = (dataCollection, startIndex, endIndex) => {
    // Select the last element as the pivot.
    const pivotElement = dataCollection[endIndex];
    let smallerElementIndex = startIndex - 1; // Index of the smaller element.

    // Iterate through the subarray from startIndex to endIndex - 1.
    for (let currentScanIndex = startIndex; currentScanIndex < endIndex; currentScanIndex++) {
        // If the current element is less than or equal to the pivot,
        // increment smallerElementIndex and swap the elements.
        if (dataCollection[currentScanIndex] <= pivotElement) {
            smallerElementIndex = smallerElementIndex + 1;
            // Perform a swap: dataCollection[smallerElementIndex] and dataCollection[currentScanIndex]
            const leftSwapCandidate = dataCollection[currentScanIndex];
            const rightSwapCandidate = dataCollection[smallerElementIndex];
            dataCollection[smallerElementIndex] = leftSwapCandidate;
            dataCollection[currentScanIndex] = rightSwapCandidate;
        }
    }

    // Place the pivot element in its correct sorted position.
    // Swap dataCollection[smallerElementIndex + 1] and dataCollection[endIndex] (the original pivot).
    const rightSwapCandidate = dataCollection[endIndex];
    const leftSwapCandidate = dataCollection[smallerElementIndex + 1];
    dataCollection[smallerElementIndex + 1] = rightSwapCandidate;
    dataCollection[endIndex] = leftSwapCandidate;

    // Return the final index of the pivot element.
    return smallerElementIndex + 1;
};
