function processInput(rawInputData) {
    // Process the raw input string: trim whitespace and split into individual lines.
    const inputLines = rawInputData.trim().split('\n');

    // Extract the total number of elements from the first line of input.
    const elementCount = Number(inputLines.shift());

    // Parse the second line of input, splitting by spaces and converting each part to a number.
    const dataArray = inputLines.shift().split(' ').map(Number);

    // Call the partitioning routine with the array, starting index (0), and exclusive end index.
    const processedArray = divideAndArrange(dataArray, 0, elementCount);

    // Output the resulting array elements, joined by a single space.
    console.log(processedArray.join(' '));
}

// This function performs a partitioning operation on a given array segment.
// It reorders elements such that all elements less than or equal to the pivot
// are placed before it, and the pivot itself is marked with brackets.
function divideAndArrange(dataArray, startIndex, endIndex) {
    // The pivot element is chosen as the last element of the segment.
    let pivotValue = dataArray[endIndex - 1];

    // 'lessThanPivotIndex' keeps track of the boundary for elements found to be
    // less than or equal to the pivot.
    let lessThanPivotIndex = startIndex;

    // Iterate through the array segment from the start up to (but not including) the pivot.
    for (let currentIdx = startIndex, loopLimitIdx = endIndex - 1; currentIdx < loopLimitIdx; currentIdx++) {
        // If the current element is less than or equal to the pivot, swap it
        // with the element at 'lessThanPivotIndex' and advance the boundary.
        if (dataArray[currentIdx] <= pivotValue) {
            let tempVal = dataArray[currentIdx];
            dataArray[currentIdx] = dataArray[lessThanPivotIndex];
            dataArray[lessThanPivotIndex] = tempVal;
            lessThanPivotIndex++; // Increment the boundary for smaller elements
        }
    }

    // After the loop, place the original pivot value into its final sorted position.
    // First, temporarily store the element currently at 'lessThanPivotIndex'.
    let tempVal = dataArray[lessThanPivotIndex];
    // Move the element that was originally at the pivot's position to 'lessThanPivotIndex'.
    dataArray[endIndex - 1] = tempVal;
    // Format the pivot value by enclosing it in square brackets for output.
    pivotValue = `[${pivotValue}]`;
    // Place the formatted pivot value at its correct position.
    dataArray[lessThanPivotIndex] = pivotValue;

    // Return the modified array.
    return dataArray;
}

// Initiate the processing by reading the input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
