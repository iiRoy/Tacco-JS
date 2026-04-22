// Function to orchestrate the entire process of reading input, parsing,
// performing a specific array partitioning, and displaying the result.
function processInputAndPartition(rawInputDataString) {
    // --- Type II: Rename variables, reformat whitespace, add comments ---
    // Trim any leading/trailing whitespace from the raw input and
    // split it into an array of individual lines.
    const inputLines = rawInputDataString.trim().split('\n');

    // --- Type III: Add input validation / guard clauses ---
    // Ensure that at least two lines of input are provided:
    // one for the element count and one for the data sequence.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        // Terminate execution gracefully if input is malformed.
        return;
    }

    // --- Type II: Rename variables, use robust parsing ---
    // Extract the first line, which represents the total number of elements.
    const elementCountString = inputLines.shift();
    // Use parseInt with radix for safer and more explicit number conversion.
    const totalElementCount = parseInt(elementCountString, 10);

    // --- Type III: Add input validation ---
    // Validate that the parsed count is a valid non-negative number.
    if (isNaN(totalElementCount) || totalElementCount < 0) {
        console.error(`Error: Invalid element count '${elementCountString}'. Must be a non-negative integer.`);
        return;
    }

    // --- Type II: Rename variables, use helper function ---
    // Extract the second line, which contains the space-separated numeric data.
    const dataSequenceString = inputLines.shift();
    // --- Type III: Introduce helper function for parsing ---
    // Utilize a dedicated helper to parse the string into an array of numbers.
    const numericDataSequence = parseSpaceSeparatedNumbers(dataSequenceString, totalElementCount);

    // --- Type III: Add input validation ---
    // Verify that the parsed numeric array matches the expected count.
    if (!numericDataSequence || numericDataSequence.length !== totalElementCount) {
        console.error(`Error: Data sequence length mismatch. Expected ${totalElementCount} elements, got ${numericDataSequence ? numericDataSequence.length : 0}.`);
        return;
    }

    // --- Type II: Rename variables ---
    // Invoke the array partitioning function. The function operates in-place.
    const finalPartitionedArray = applyLomutoPartitionVariant(numericDataSequence, 0, totalElementCount);

    // --- Type III: Update output formatting ---
    // Output the resulting array elements, joined by spaces, with a descriptive label.
    console.log("Resulting Partition:", finalPartitionedArray.join(' '));
}

// --- Type III: Add new helper function ---
// Helper function to parse a string of space-separated numbers into a numeric array.
function parseSpaceSeparatedNumbers(inputString, expectedCount) {
    if (!inputString) {
        return []; // Return an empty array for empty input string
    }
    // Split by space, convert each part to an integer, and filter out any non-numeric results.
    const numbers = inputString.split(' ').map(val => parseInt(val, 10));
    // Ensure all values are valid numbers.
    return numbers.filter(num => !isNaN(num));
}


// --- Type II: Rename function, parameters, variables, update comments ---
// Implements a variation of the Lomuto partition scheme for an array segment.
// This function modifies the provided array in-place.
function applyLomutoPartitionVariant(targetArray, segmentStartIdx, segmentEndIdxExclusive) {
    // --- Type III: Add guard clauses for robustness ---
    // If the segment is empty, contains a single element, or indices are invalid,
    // no partitioning is needed or possible. Return the array as is.
    if (segmentStartIdx >= segmentEndIdxExclusive || targetArray.length === 0 ||
        segmentStartIdx < 0 || segmentEndIdxExclusive > targetArray.length) {
        return targetArray; // No changes performed.
    }

    // --- Type III: Introduce intermediate variables for clarity ---
    // The pivot is chosen as the last element of the current segment.
    const pivotElementOriginalIndex = segmentEndIdxExclusive - 1;
    const chosenPivotValue = targetArray[pivotElementOriginalIndex];

    // 'boundaryIndex' will keep track of the boundary between elements
    // less than or equal to the pivot and elements greater than the pivot.
    let boundaryIndex = segmentStartIdx;

    // --- Type II: Update loop structure and variable names ---
    // Iterate through the segment from the start index up to, but not including, the pivot.
    for (let currentIterationIndex = segmentStartIdx; currentIterationIndex < pivotElementOriginalIndex; ++currentIterationIndex) {
        // If the current element is less than or equal to the pivot,
        // it belongs to the 'left' side of the partition.
        if (targetArray[currentIterationIndex] <= chosenPivotValue) {
            // --- Type III: Update swap logic using array destructuring ---
            // Swap the current element with the element at 'boundaryIndex'.
            // This moves elements smaller than the pivot to the left side.
            [targetArray[currentIterationIndex], targetArray[boundaryIndex]] =
            [targetArray[boundaryIndex], targetArray[currentIterationIndex]];
            // Advance the boundary.
            boundaryIndex++;
        }
    }

    // --- Type II & III: Rewrite pivot placement logic for clarity and specific formatting ---
    // After the loop, 'boundaryIndex' is the correct position for the pivot element.
    // 1. Swap the element currently at 'boundaryIndex' with the original pivot element.
    //    This places the pivot at 'boundaryIndex' and moves the element that was there
    //    to the pivot's initial position (which is now after the partition).
    [targetArray[boundaryIndex], targetArray[pivotElementOriginalIndex]] =
    [targetArray[pivotElementOriginalIndex], targetArray[boundaryIndex]];

    // 2. A specific requirement: the pivot element at its final position
    //    must be represented as a string "[value]". This is a Type III change
    //    as it modifies the data type of an element in the array.
    targetArray[boundaryIndex] = `[${chosenPivotValue}]`;

    // Return the array that has been modified in-place.
    return targetArray;
}

// --- Entry point for script execution ---
// Read the entire content of standard input synchronously and
// then pass it to our main processing function.
processInputAndPartition(require('fs').readFileSync('/dev/stdin', 'utf8'));