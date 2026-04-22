// This JavaScript module provides a function to re-arrange elements within a numeric sequence
// based on a chosen pivot, a fundamental operation often used in algorithms like Quicksort.

/**
 * Re-arranges a segment of a numeric array around a pivot element.
 * This implementation uses a variant of the Hoare partition scheme,
 * where the last element of the segment is chosen as the pivot.
 * Elements smaller than or equal to the pivot are moved to its left,
 * and larger elements to its right. The pivot is then placed in its
 * final sorted position within the segment.
 *
 * @param {number[]} targetArray - The array of numbers to be partitioned.
 * @param {number} lowerBound - The starting index of the segment to partition (inclusive).
 * @param {number} upperBound - The ending index of the segment to partition (inclusive).
 * @returns {number} The final index of the pivot element after partitioning,
 *                   or -1 if the input array or bounds are invalid.
 */
function segmentArray(targetArray, lowerBound, upperBound) {
    // --- Input Validation and Guard Clauses (Type III Addition) ---
    // Ensure the input is a valid array and not empty.
    if (!Array.isArray(targetArray) || targetArray.length === 0) {
        // In a production environment, one might throw an error. For this context,
        // returning a sentinel value like -1 indicates failure.
        return -1;
    }
    // Validate the provided bounds to prevent out-of-bounds access or illogical ranges.
    if (lowerBound < 0 || upperBound >= targetArray.length || lowerBound > upperBound) {
        return -1; // Indicates invalid range for partitioning.
    }
    // If the segment contains only one element or is empty, it's already "partitioned".
    if (lowerBound === upperBound) {
        return lowerBound;
    }

    // --- Pivot Selection (Type II: Renaming) ---
    // The element at the upper boundary is chosen as the pivot for comparison.
    const comparisonElement = targetArray[upperBound];

    // --- Boundary Marker Initialization (Type II: Renaming) ---
    // This pointer keeps track of the "rightmost" position of an element
    // that is less than or equal to the pivot. It effectively marks the
    // boundary between the 'smaller' and 'larger' partitions.
    let leftBoundaryMarker = lowerBound - 1;

    // --- Iteration and Element Placement (Type II: Renaming, Type III: Update) ---
    // Loop through the segment from the lower bound up to, but not including, the pivot element.
    for (let iteratorPointer = lowerBound; iteratorPointer < upperBound; iteratorPointer++) {
        // If the current element being examined is less than or equal to the pivot,
        // it belongs to the 'smaller' partition.
        if (targetArray[iteratorPointer] <= comparisonElement) {
            // Increment the left boundary marker to reserve space for the new 'smaller' element.
            leftBoundaryMarker++;
            // Perform a swap: exchange the current element (targetArray[iteratorPointer])
            // with the element at the leftBoundaryMarker position (targetArray[leftBoundaryMarker]).
            // This ensures elements <= pivot are moved to the left side of the marker.
            // (Type III: ES6 destructuring assignment for swapping is an equivalent update).
            [targetArray[leftBoundaryMarker], targetArray[iteratorPointer]] =
            [targetArray[iteratorPointer], targetArray[leftBoundaryMarker]];
        }
    }

    // --- Final Pivot Placement (Type II: Renaming, Type III: Update) ---
    // After the loop, all elements less than or equal to the pivot are positioned
    // to the left of `leftBoundaryMarker + 1`. The pivot needs to be placed
    // at this exact position to separate the two partitions.
    const finalPivotIndex = leftBoundaryMarker + 1;
    // Swap the pivot element (originally at upperBound) with the element
    // at the calculated finalPivotIndex.
    [targetArray[finalPivotIndex], targetArray[upperBound]] =
    [targetArray[upperBound], targetArray[finalPivotIndex]];

    // Return the index where the pivot element now resides.
    return finalPivotIndex;
}

// --- Main Program Execution Flow ---

// (Type II: Using 'const' for modules and constants, 'let' for mutable variables)
const fileSystem = require('fs'); // (Type II: Renaming 'fs' to 'fileSystem')

// Define the standard input file path for competitive programming environments.
const standardInputPath = '/dev/stdin'; // (Type III: Added helper variable)

let rawInputContent;
try {
    // (Type III: Added try-catch for robust file reading)
    // Synchronously read the entire content from the standard input stream.
    rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    // Log the error and terminate the process if input cannot be read.
    console.error("Error encountered while attempting to read input:", readError.message);
    process.exit(1); // Exit with a non-zero status code to indicate failure.
}

// Split the raw input string into an array, where each element is a line.
const inputLinesArray = rawInputContent.split('\n'); // (Type II: Renaming 'lines')

// (Type III: Added validation for input structure)
// Ensure there are at least two lines: one for count (which we'll discard) and one for the array data.
if (inputLinesArray.length < 2) {
    console.error("Input data is insufficient. Expected at least two lines.");
    process.exit(1);
}

// (Type III: Deletion of non-essential statement)
// The first line typically contains the count of elements. In this specific problem's output format,
// this count isn't directly used for processing the array itself, so we can discard it.
inputLinesArray.shift();

// (Type II: Renaming 'A', Type III: Updated map function syntax)
// The next line (which is now the first element of inputLinesArray) contains the space-separated numbers.
// Split this string by spaces and convert each part into a numeric type.
const numericSequence = inputLinesArray.shift()
    .split(' ') // Split the string of numbers by space.
    // Use an arrow function for conciseness and clarity in the mapping operation.
    .map(valueString => Number(valueString)); // Convert each string segment to a number.

// (Type III: Added helper variable for output formatting)
const outputDelimiter = ' ';

// (Type II: Renaming 'idx')
// Call the partitioning function on the entire numeric sequence.
// The `lowerBound` is 0 (start of array), and `upperBound` is the last index.
const finalPivotPosition = segmentArray(numericSequence, 0, numericSequence.length - 1);

// (Type III: Added validation for the result of partitioning)
if (finalPivotPosition === -1) {
    console.error("The array partitioning operation failed due to invalid internal state or input.");
    process.exit(1);
}

// (Type III: Updated string concatenation using template literals)
// Modify the element at the pivot's final position by enclosing its value in square brackets.
numericSequence[finalPivotPosition] = `[${numericSequence[finalPivotPosition]}]`;

// Print the modified array elements, joined back into a single string
// using the specified output delimiter.
console.log(numericSequence.join(outputDelimiter));