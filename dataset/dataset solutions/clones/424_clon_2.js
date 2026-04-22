/*
 * This module provides functionality for searching within sorted data.
 * It reads input from standard input, processes it, and performs
 * an iterative search operation.
 */

/**
 * Executes an iterative search for a specific numeric value within a globally accessible,
 * pre-sorted array of numbers. This function is an example of Type II code cloning.
 * @param {number} targetVal The specific numeric element that needs to be found.
 * @returns {number} The total count of steps or iterations performed during the search process.
 */
function findPosition(targetVal) {
    let lowerBound = 0; /*  Initialize the starting index for the search segment. */
    let upperBound = numericDataSet.length; /*  Set the ending index to the total size of the array. */
    let searchCycleCount = 0; /*  Initialize a counter to track the number of iterations. */

    // Begin an indefinite loop for the core search algorithm.
    while (true) {
        searchCycleCount++; // Increment the iteration counter for the current cycle.

        // If the lower bound meets or surpasses the upper bound, it means the search space has collapsed.
        if (lowerBound >= upperBound) {
            break; // Exit the loop; the element is not found or the range is invalid.
        }

        // Compute the midpoint index of the current search interval.
        // Math.floor ensures an integer index is used for array access.
        const middleIndex = Math.floor((lowerBound + upperBound) / 2);

        // Check if the element at the computed middle index matches the target value.
        if (numericDataSet[middleIndex] === targetVal) {
            return searchCycleCount; // Element found, return the total iterations.
        }
        // If the target value is numerically smaller than the element at the middle index,
        // the search space is narrowed to the left half.
        else if (targetVal < numericDataSet[middleIndex]) {
            upperBound = middleIndex; // Adjust the upper boundary to the middle index.
        }
        // If the target value is numerically larger, the search space is narrowed to the right half.
        else {
            lowerBound = middleIndex + 1; // Adjust the lower boundary to one position past the middle.
        }
    }

    // If the loop concludes without finding the target, return the final count of iterations.
    return searchCycleCount;
}

// --- Main Program Flow Starts Here ---

// Acquire all incoming data from the standard input stream, interpreting it as UTF-8 text.
const rawDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove any leading/trailing whitespace and then divide it into an array of lines.
const parsedLines = (rawDataStream.trim()).split("\n");

let linePointer = 0; // Establish an index to navigate through the 'parsedLines' array.

// Initiate the primary loop designed to process multiple distinct test cases.
while (true) {
    // Extract the count of elements for the current test case from the present line.
    // The '-0' idiom converts the string representation into a numerical type.
    let countOfElements = parsedLines[linePointer] - 0;
    linePointer++; // Advance the line pointer to the subsequent line.

    // A zero value for 'countOfElements' signals the termination of input data.
    if (countOfElements === 0) {
        break; // Terminate the main processing loop.
    }

    // Declare and initialize an empty array to hold the numeric data for the current test case.
    // This array will be utilized by the 'findPosition' function.
    let numericDataSet = [];

    // Iterate to populate the 'numericDataSet' array with 'countOfElements' values from the input.
    for (let indexVal = 0; indexVal < countOfElements; indexVal++) {
        numericDataSet.push(parsedLines[linePointer] - 0); // Append the parsed number to the data set.
        linePointer++; // Move the line pointer to the next input line.
    }

    // Parse the target search value from the next line in the input.
    let searchTarget = parsedLines[linePointer] - 0;
    linePointer++; // Increment the line pointer once more.

    // Invoke the search function with the determined target and output its result to the console.
    console.log(findPosition(searchTarget));
}

// End of script execution.