const applicationState = {
    // Stores the total number of inversions detected during the sorting process.
    cumulativeInversions: 0,
    // A constant representing a very large number, used as a sentinel value in merge operations
    // to simplify boundary checks. Using MAX_SAFE_INTEGER instead of 1/0 for clarity and robustness.
    POSITIVE_SENTINEL: Number.MAX_SAFE_INTEGER
};

// Import the 'fs' module for file system operations, primarily for reading input.
const fileSystem = require('fs');

// Read all input lines from standard input, decode as UTF-8, and split by newline characters.
// This handles the typical competitive programming input format.
const rawInputLines = fileSystem.readFileSync('/dev/stdin', 'utf-8').split('\n');

/**
 * Merges two already sorted segments of an array into a single sorted segment.
 * As a side effect, this function also counts the number of inversions
 * that occur between the two segments.
 *
 * @param {number[]} workingCollection - The array containing the segments to be merged.
 * @param {number} startIdx - The starting index (inclusive) of the first segment.
 * @param {number} midPoint - The index that separates the first segment from the second.
 *                            It is the end (exclusive) of the first segment and start (inclusive) of the second.
 * @param {number} endIdx - The ending index (exclusive) of the second segment.
 * @returns {void}
 */
const combineSortedSegments = (workingCollection, startIdx, midPoint, endIdx) => {
    // Basic validation to prevent errors with invalid segment boundaries.
    // If the segment is empty or malformed, there's nothing to merge.
    if (!Array.isArray(workingCollection) || startIdx < 0 || midPoint < startIdx || endIdx < midPoint || endIdx <= startIdx) {
        return;
    }
    // If the segment has 0 or 1 element, it's inherently sorted, no merge needed.
    if (endIdx - startIdx <= 1) {
        return;
    }

    // Calculate the lengths of the two sub-arrays to be merged.
    const leftSegmentLength = midPoint - startIdx;
    const rightSegmentLength = endIdx - midPoint;

    // Create temporary arrays by slicing the original array. This is a cleaner way
    // than manually copying elements with a loop (Type III change).
    const tempLeftSegment = workingCollection.slice(startIdx, midPoint);
    const tempRightSegment = workingCollection.slice(midPoint, endIdx);

    // Append a sentinel value to the end of each temporary array. This eliminates
    // the need for explicit checks to see if one array has been exhausted during merging.
    tempLeftSegment.push(applicationState.POSITIVE_SENTINEL);
    tempRightSegment.push(applicationState.POSITIVE_SENTINEL);

    // Initialize pointers for iterating through the temporary left and right segments.
    let leftSegmentPointer = 0;
    let rightSegmentPointer = 0;

    // Iterate through the range of the original array that is being merged.
    for (let currentOutputPosition = startIdx; currentOutputPosition < endIdx; ++currentOutputPosition) {
        // Compare the elements currently pointed to in the left and right temporary segments.
        if (tempLeftSegment[leftSegmentPointer] <= tempRightSegment[rightSegmentPointer]) {
            // If the element from the left segment is smaller or equal, place it next in the main array.
            workingCollection[currentOutputPosition] = tempLeftSegment[leftSegmentPointer];
            leftSegmentPointer++; // Advance the pointer for the left segment.
        } else {
            // If the element from the right segment is smaller, place it next in the main array.
            workingCollection[currentOutputPosition] = tempRightSegment[rightSegmentPointer];
            rightSegmentPointer++; // Advance the pointer for the right segment.

            // Crucially, when an element from the right segment is chosen, it means it is
            // smaller than all remaining elements in the left segment. Each of these remaining
            // elements forms an inversion with the current right segment element.
            applicationState.cumulativeInversions += (leftSegmentLength - leftSegmentPointer);
        }
    }
};

/**
 * Recursively sorts a segment of an array using the merge sort algorithm.
 * This function divides the array into halves, recursively sorts them,
 * and then merges the sorted halves while counting inversions.
 *
 * @param {number[]} dataCollection - The array to be sorted.
 * @param {number} lowerBoundary - The starting index (inclusive) of the segment to sort.
 * @param {number} upperBoundary - The ending index (exclusive) of the segment to sort.
 * @returns {void}
 */
const divideAndConquerSort = (dataCollection, lowerBoundary, upperBoundary) => {
    // Ensure the input is an array; a guard clause for robustness (Type III addition).
    if (!Array.isArray(dataCollection)) {
        return;
    }

    // Base case for the recursion: if the segment contains 0 or 1 element, it is
    // considered sorted, and no further action is needed.
    // The condition is rewritten for clarity (Type III change).
    if (upperBoundary - lowerBoundary <= 1) {
        return;
    }

    // Calculate the midpoint of the current segment.
    // Using bitwise right shift (>>> 1) for efficient integer division (Type III change).
    const splittingPoint = (lowerBoundary + upperBoundary) >>> 1;

    // Recursively sort the left half of the segment.
    divideAndConquerSort(dataCollection, lowerBoundary, splittingPoint);
    // Recursively sort the right half of the segment.
    divideAndConquerSort(dataCollection, splittingPoint, upperBoundary);

    // After both halves are sorted, merge them back together and count inversions.
    combineSortedSegments(dataCollection, lowerBoundary, splittingPoint, upperPoint);
};

// This function encapsulates the main execution flow of the program.
// Encapsulating in a function is a Type III structural addition.
const mainExecutionBlock = () => {
    // The problem specifies input on the second line (index 1).
    // Safely access the second line, split it by spaces, and convert each part to a number.
    // Includes robust error handling for non-numeric values (Type III addition).
    const inputNumericSequence = (rawInputLines[1] || '')
                                .split(' ')
                                .map(parsedValue => {
                                    const num = Number(parsedValue);
                                    // If a value cannot be converted to a number, treat it as 0
                                    // or handle as an error, depending on problem constraints.
                                    // Here, we default to 0 and will filter non-finite numbers later.
                                    return isNaN(num) ? 0 : num;
                                });

    // Filter out any non-finite numbers (NaN, Infinity) that might have resulted from parsing errors.
    // This ensures that the sorting algorithm only operates on valid numbers (Type III addition).
    const finalDataArray = inputNumericSequence.filter(Number.isFinite);

    // Initiate the merge sort process on the entire processed array.
    // The `0` represents the starting index, and `finalDataArray.length` is the exclusive end index.
    divideAndConquerSort(finalDataArray, 0, finalDataArray.length);

    // Output the total number of inversions found during the sorting process.
    // The count is retrieved from the global application state object.
    console.log(applicationState.cumulativeInversions);
};

// Execute the main logic when the script runs.
mainExecutionBlock();