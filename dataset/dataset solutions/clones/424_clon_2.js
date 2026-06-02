// This function performs a binary search on a pre-defined global sorted array.
// It takes a target value and returns the number of comparisons (iterations)
// required to find the value or determine its absence.
function findInSortedArray(targetValue) {
    let lowIndex = 0; // The starting index for the search range (inclusive).
    let highIndex = sortedData.length; // The ending index for the search range (exclusive).
    let iterationCount = 0; // A counter to track how many steps the search takes.

    // The core binary search loop. It continues until the search range is empty.
    while (true) {
        iterationCount++; // Increment the counter for each comparison step.

        // If the lower bound meets or exceeds the upper bound, the element is not in the array.
        if (lowIndex >= highIndex) {
            break; // Exit the loop as the search range has collapsed.
        }

        // Calculate the middle index of the current search segment.
        // Math.floor ensures we get an integer index.
        const midPoint = Math.floor((lowIndex + highIndex) / 2);

        // Compare the element at the midpoint with our target value.
        if (sortedData[midPoint] === targetValue) {
            return iterationCount; // Target found, return the number of iterations.
        }
        // If the target is smaller than the midpoint element, search the left half.
        else if (targetValue < sortedData[midPoint]) {
            highIndex = midPoint; // Adjust the upper bound to the midpoint.
        }
        // If the target is larger than the midpoint element, search the right half.
        else {
            lowIndex = midPoint + 1; // Adjust the lower bound to one past the midpoint.
        }
    }
    // If the loop completes without finding the target, return the total iterations.
    // This count represents the effort to confirm absence.
    return iterationCount;
}

// Declare a global array that will hold the numbers to be searched.
// This array is re-populated for each test case from the input.
let sortedData = [];

// Read all standard input as a single UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into lines.
const lineSegments = (rawData.trim()).split("\n");

// Initialize an index to navigate through the lines of input.
let currentLineIdx = 0;

// Main program loop: processes multiple test cases from the input.
// It continues until a test case with size 0 is encountered.
while (true) {
    // Read the number of elements for the current test case.
    // The `-0` is a concise way to convert a string to a number.
    const dataSize = lineSegments[currentLineIdx] - 0;
    currentLineIdx++; // Advance to the next line in the input.

    // Check for the termination condition: a data size of 0.
    if (dataSize === 0) {
        break; // Exit the main processing loop.
    }

    // Clear the global array to prepare for the new set of numbers for this test case.
    sortedData = [];

    // Populate the global array with `dataSize` numbers from the input.
    for (let loopVar = 0; loopVar < dataSize; loopVar++) {
        sortedData.push(lineSegments[currentLineIdx] - 0); // Add number to array.
        currentLineIdx++; // Advance to the next line.
    }

    // Read the search value for the current test case.
    const searchValue = lineSegments[currentLineIdx] - 0;
    currentLineIdx++; // Advance to the next line.

    // Execute the binary search function with the current search value
    // and print the returned iteration count to the console.
    console.log(findInSortedArray(searchValue));
}
