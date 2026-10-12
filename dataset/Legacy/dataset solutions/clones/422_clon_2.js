function findPosition(dataArray, targetValue) {
    // Initialize the starting index for the search range.
    let startIndex = 0;
    // Initialize the ending index for the search range (exclusive upper bound).
    let endIndex = dataArray.length;
    // Counter to track the number of comparisons made during the search.
    let iterationCount = 0;

    // Begin an indefinite loop for the binary search process.
    for (;;) {
        iterationCount++; // Increment the counter for each iteration.

        // If the start index surpasses the end index, the element is not present.
        if (startIndex > endIndex) {
            break; // Exit the loop as the search space is exhausted.
        }

        // Calculate the middle index of the current search segment.
        const middleIndex = Math.floor((startIndex + endIndex) / 2);

        // Check if the element at the calculated middle index matches the target value.
        if (dataArray[middleIndex] === targetValue) {
            return iterationCount; // Return the count if the target is found.
        }

        // Adjust the search boundaries based on the comparison.
        if (targetValue < dataArray[middleIndex]) {
            endIndex = middleIndex; // If target is smaller, search in the left half.
        } else {
            startIndex = middleIndex + 1; // If target is larger, search in the right half.
        }
    }
    // If the loop completes without finding the target, return the final iteration count.
    return iterationCount;
}

// Read the entire content from standard input as a UTF-8 string.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the input: remove leading/trailing whitespace and split into an array of lines.
let lineSegments = fileContent.trim().split('\n');

// Loop continuously to process multiple test cases from the input.
while (true) {
    // Extract the first line, convert it to a number, representing the count of elements.
    let elementCount = lineSegments.shift() - 0;

    // If the element count is zero, it signifies the end of input, so break the loop.
    if (elementCount === 0) {
        break;
    }

    // Create a new array to store the numeric data for the current test case.
    const numericData = [];
    // Populate the numericData array with 'elementCount' numbers from subsequent input lines.
    for (let idx = 0; idx < elementCount; idx++) {
        numericData.push(lineSegments.shift() - 0); // Convert each line to a number and add.
    }

    // Perform the binary search on the 'numericData' array for the next target value from input.
    // The result (iteration count) is then printed to the console.
    console.log(findPosition(numericData, lineSegments.shift() - 0));
}
