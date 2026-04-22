/**
 * A constant defining the standard input file path for reading data.
 * This ensures consistency and makes the path easily modifiable if needed.
 */
const STD_INPUT_PATH = '/dev/stdin';

/**
 * Parses a string containing space-separated numbers into an array of number primitives.
 * Includes basic validation for empty or invalid input strings.
 * @param {string} numberSequenceString - The input string, e.g., "1 2 3 4".
 * @returns {number[]} An array of numbers, or an empty array if the input is invalid.
 */
function parseNumberArrayFromString(numberSequenceString) {
    // Guard against null, undefined, or empty strings.
    if (!numberSequenceString || typeof numberSequenceString !== 'string' || numberSequenceString.trim() === '') {
        console.warn("Warning: Received empty or invalid string for number array parsing. Returning empty array.");
        return [];
    }
    // Split by space and convert each part to a Number.
    // Filter out any non-numeric results (like `NaN` from `Number('')`).
    return numberSequenceString.split(' ').map(Number).filter(num => !isNaN(num));
}

/**
 * Orchestrates the entire process of reading input, parsing data,
 * performing the sorting with inversion counting, and displaying the result.
 * This serves as the primary entry point for the application logic.
 * @param {string} rawInputContent - The raw string content obtained from the standard input.
 */
function executeSortingAndCountingTask(rawInputContent) {
    // Pre-process the raw input: trim leading/trailing whitespace and split into individual lines.
    const processedInputLines = rawInputContent.trim().split('\n');

    // Extract the array size from the first line of input.
    const declaredArraySizeStr = processedInputLines.shift();
    const numberOfElements = Number(declaredArraySizeStr);

    // Implement robust validation for the array size.
    if (isNaN(numberOfElements) || numberOfElements < 0) {
        console.error("Critical Error: The specified number of elements is invalid or negative. Aborting.");
        // In a real application, you might throw an error or exit the process.
        return;
    }
    if (numberOfElements === 0) {
        console.log(0); // No elements, no inversions.
        return;
    }

    // Extract the array elements from the second line of input using a helper function.
    const elementsDataString = processedInputLines.shift();
    const dataCollection = parseNumberArrayFromString(elementsDataString);

    // Verify that the actual number of elements matches the declared size.
    if (dataCollection.length !== numberOfElements) {
        console.warn(`Data Mismatch Warning: Declared size (${numberOfElements}) does not match actual element count (${dataCollection.length}). Processing with actual count.`);
        // Adjust the effective number of elements if there's a discrepancy.
        // This ensures the sorting algorithm operates on the actual data length.
        // If strictness is required, one might throw an error here.
    }

    // Initialize a single-element array to serve as a mutable counter for inversions.
    // This allows the count to be updated by reference across recursive function calls.
    const cumulativeInversionCount = new Array(1).fill(0);

    // Initiate the recursive divide-and-conquer sorting process.
    // The `dataCollection` array will be sorted in-place, and `cumulativeInversionCount` will be updated.
    divideAndConquerSortWithInversionCounting(dataCollection, 0, dataCollection.length, cumulativeInversionCount);

    // Output the final computed number of inversions.
    console.log(cumulativeInversionCount[0]);
}

/**
 * Implements the recursive merge sort algorithm, enhanced to count inversions.
 * This function divides the array into halves until individual elements are reached,
 * then merges them back while tallying inversions.
 * @param {number[]} workingArray - The array segment currently being sorted.
 * @param {number} startIdx - The starting index (inclusive) of the current segment.
 * @param {number} endIdx - The ending index (exclusive) of the current segment.
 * @param {number[]} inversionTallyRef - A reference to the array holding the total inversion count.
 */
function divideAndConquerSortWithInversionCounting(workingArray, startIdx, endIdx, inversionTallyRef) {
    // Base case for recursion: if the segment has 0 or 1 element, it's considered sorted,
    // and no inversions can be formed within it.
    const segmentLength = endIdx - startIdx;
    if (segmentLength <= 1) {
        return;
    }

    // Determine the midpoint to split the array into two sub-segments.
    // Using bitwise right shift (>>) for efficient integer division.
    const splitPoint = startIdx + ((endIdx - startIdx) >> 1);

    // Recursively sort the left sub-segment.
    divideAndConquerSortWithInversionCounting(workingArray, startIdx, splitPoint, inversionTallyRef);
    // Recursively sort the right sub-segment.
    divideAndConquerSortWithInversionCounting(workingArray, splitPoint, endIdx, inversionTallyRef);

    // After both halves are sorted, merge them back and count inversions formed between them.
    mergeSortedSegmentsAndCountInversions(workingArray, startIdx, splitPoint, endIdx, inversionTallyRef);
}

/**
 * Merges two already sorted sub-segments of an array back into a single sorted segment.
 * During this merge process, it identifies and counts inversions where an element from the
 * right sub-segment is smaller than an element from the left sub-segment.
 * @param {number[]} targetArray - The main array where segments are being merged.
 * @param {number} segmentStart - The starting index of the first sub-segment.
 * @param {number} divisionPoint - The ending index of the first sub-segment and start of the second.
 * @param {number} segmentEnd - The ending index (exclusive) of the second sub-segment.
 * @param {number[]} inversionTallyRef - A reference to the array holding the total inversion count.
 */
function mergeSortedSegmentsAndCountInversions(targetArray, segmentStart, divisionPoint, segmentEnd, inversionTallyRef) {
    // Create temporary copies of the left and right sub-segments.
    const leftSegment = targetArray.slice(segmentStart, divisionPoint);
    const rightSegment = targetArray.slice(divisionPoint, segmentEnd);

    // Append a "sentinel" value to each temporary segment. This is a very large number
    // that simplifies the merge loop by eliminating the need for explicit boundary checks
    // when one segment is exhausted.
    const sentinelValue = Number.MAX_SAFE_INTEGER;
    leftSegment.push(sentinelValue);
    rightSegment.push(sentinelValue);

    let leftSegmentPointer = 0;  // Index for iterating through the left segment.
    let rightSegmentPointer = 0; // Index for iterating through the right segment.

    // Iterate through the original array's segment range, filling it with sorted elements.
    for (let currentFillIndex = segmentStart; currentFillIndex < segmentEnd; currentFillIndex++) {
        const currentLeftElement = leftSegment[leftSegmentPointer];
        const currentRightElement = rightSegment[rightSegmentPointer];

        if (currentLeftElement <= currentRightElement) {
            // If the element from the left segment is smaller or equal, it comes next.
            targetArray[currentFillIndex] = currentLeftElement;
            leftSegmentPointer++;
        } else {
            // If the element from the right segment is smaller, it signifies inversions.
            // All remaining elements in the left segment (from 'leftSegmentPointer' onwards)
            // are greater than the 'currentRightElement', thus forming an inversion.
            targetArray[currentFillIndex] = currentRightElement;
            rightSegmentPointer++;

            // Calculate the number of inversions:
            // (divisionPoint - segmentStart) is the original size of the left segment.
            // 'leftSegmentPointer' is how many elements have already been moved from the left.
            // The difference gives the count of remaining elements in the left segment
            // that are greater than the 'currentRightElement'.
            inversionTallyRef[0] += (divisionPoint - segmentStart) - leftSegmentPointer;
        }
    }
}

// Main execution block:
// Reads input from standard input, handles potential errors, and initiates the task.
try {
    // Read the entire content of the standard input asynchronously.
    const rawInputString = require('fs').readFileSync(STD_INPUT_PATH, 'utf8');
    // Call the main processing function with the raw input.
    executeSortingAndCountingTask(rawInputString);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or task execution.
    console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}