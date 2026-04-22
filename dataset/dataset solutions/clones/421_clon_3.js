// Function to determine the number of iterations required to locate a value
// within a sorted collection using a binary search approach.
// This function counts comparison attempts, whether the target is found or not.
function locateValueSteps(sortedCollection, targetElement) {
    // Initialize lower and upper bounds for the search space.
    // 'lowerIndex' is inclusive, 'upperIndex' is exclusive.
    let lowerIndex = 0;
    let upperIndex = sortedCollection.length;
    // Counter for the number of comparison operations performed.
    let operationCount = 0;

    // Continue searching as long as the valid range exists (lower bound is less than upper bound).
    while (lowerIndex < upperIndex) {
        // Calculate the middle index. This method (low + (high - low) / 2)
        // helps prevent potential integer overflow with very large indices,
        // although less critical in JavaScript due to 64-bit floats for numbers.
        const currentMidIndex = lowerIndex + Math.floor((upperIndex - lowerIndex) / 2);

        // Increment the operation counter for each comparison attempt.
        operationCount++;

        // Retrieve the element at the calculated middle index.
        const elementAtMid = sortedCollection[currentMidIndex];

        // Check if the element at the middle is our target.
        if (elementAtMid === targetElement) {
            // If found, return the total number of operations.
            return operationCount;
        } else if (targetElement < elementAtMid) {
            // If the target is smaller, adjust the upper bound to the current middle index.
            // The search continues in the left half.
            upperIndex = currentMidIndex;
        } else {
            // If the target is larger, adjust the lower bound to one past the current middle index.
            // The search continues in the right half.
            lowerIndex = currentMidIndex + 1;
        }
    }

    // If the loop completes, it means the target element was not found in the collection.
    // Per the problem's requirements, we still return the total operation count.
    return operationCount;
}

// Helper function to safely extract and convert a numeric value from the processed input lines.
// This enhances readability and centralizes type conversion and basic input validation.
const extractNumericLine = (lineSegments) => {
    if (lineSegments.length === 0) {
        // In a real-world scenario, robust error handling or default values might be used.
        throw new Error("Input data stream unexpectedly exhausted.");
    }
    // Using parseInt with radix 10 ensures proper conversion from string to integer.
    return parseInt(lineSegments.shift(), 10);
};

// Load raw input data from standard input using Node.js file system module.
// The '/dev/stdin' path is standard for competitive programming environments.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. Remove leading/trailing whitespace using .trim().
// 2. Split the content into an array of strings, one for each line.
let processedInputLines = rawInputContent.trim().split("\n");

// Main processing loop: handles multiple test cases from the input.
// The loop continues until a specific termination condition is met.
while (true) {
    // Read the size of the current dataset (number of elements in the array).
    const currentDatasetSize = extractNumericLine(processedInputLines);

    // The problem specifies that a dataset size of 0 indicates the end of input.
    if (currentDatasetSize === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize a new array to store the numeric elements for the current test case.
    const numericElementsArray = [];

    // Populate the 'numericElementsArray' with 'currentDatasetSize' elements.
    // Each element is extracted and converted using the helper function.
    for (let elementIterator = 0; elementIterator < currentDatasetSize; elementIterator++) {
        numericElementsArray.push(extractNumericLine(processedInputLines));
    }

    // Read the specific target value that needs to be searched for in the array.
    const targetValueToFind = extractNumericLine(processedInputLines);

    // Execute the `locateValueSteps` function with the prepared array and target value.
    // The result (number of comparisons) is then printed to the console.
    console.log(locateValueSteps(numericElementsArray, targetValueToFind));
}