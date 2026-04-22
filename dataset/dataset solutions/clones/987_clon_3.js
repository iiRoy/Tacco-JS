const fileSystem = require('fs');

const standardInputPath = '/dev/stdin';

const acquireAndProcessInputData = (sourcePath) => {
    try {
        const rawContent = fileSystem.readFileSync(sourcePath, 'utf8');
        return rawContent.trim().split('\n');
    } catch (errorReadingInput) {
        console.error("Error encountered while fetching input data:", errorReadingInput.message);
        process.exit(1); // Terminate execution due to critical input error
    }
};

const receivedTextLines = acquireAndProcessInputData(standardInputPath);

// Validate the presence of sufficient input lines.
if (receivedTextLines.length < 2) {
    console.error("Insufficient input provided. At least two lines are necessary.");
    process.exit(1);
}

// Parse the first line to determine the anticipated count of elements.
let specifiedElementCount = parseInt(receivedTextLines[0], 10);

// Parse the second line: split by spaces, convert to numbers, and filter out any invalid numeric entries.
const numericArray = receivedTextLines[1].split(' ').map(valueStr => Number(valueStr)).filter(num => !isNaN(num));

// Perform a consistency check between the specified count and the actual number of elements.
if (isNaN(specifiedElementCount) || specifiedElementCount < 0) {
    console.warn("Warning: The provided element count is invalid or missing. Proceeding with the actual number of parsed elements.");
    specifiedElementCount = numericArray.length; // Fallback to actual length
} else if (numericArray.length !== specifiedElementCount) {
    console.warn(`Warning: Expected ${specifiedElementCount} elements based on input, but detected ${numericArray.length}. Sorting will use the detected elements.`);
}

// --- Core Algorithm: Insertion Sort Implementation ---
// This section sorts the 'numericArray' in ascending order.

// The outer loop iterates through the array, treating each element as a 'key'
// to be placed into its correct position within the already sorted sub-array to its left.
for (let currentIterationIndex = 0; currentIterationIndex < numericArray.length; ++currentIterationIndex) {

    // Store the value of the element that needs to be inserted.
    const keyElement = numericArray[currentIterationIndex];

    // Initialize an index for comparing elements within the sorted portion of the array.
    let comparisonPoint = currentIterationIndex - 1;

    // Inner loop: Shift elements in the sorted sub-array that are larger than 'keyElement'
    // one position to the right, creating space for 'keyElement'.
    while (comparisonPoint >= 0 && numericArray[comparisonPoint] > keyElement) {
        numericArray[comparisonPoint + 1] = numericArray[comparisonPoint];
        --comparisonPoint; // Move the comparison point one step to the left.
    }

    // Place the 'keyElement' into its final sorted position.
    // 'comparisonPoint + 1' is the correct slot because 'comparisonPoint' would have
    // decremented one extra time after the while loop condition became false.
    numericArray[comparisonPoint + 1] = keyElement;

    // Output the current state of the array after each insertion step.
    // This provides a visual trace of the sorting process.
    const arrayCurrentStatus = numericArray.join(' ');
    console.log(arrayCurrentStatus);
}