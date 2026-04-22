// First, we obtain the necessary module for file system operations.
let fileSystemAccess = require('fs');

// Specify the standard input device path and its character encoding.
const stdInPath = '/dev/stdin';
const charEncoding = 'utf8';

// Read the entire content from the standard input as a string.
let sourceData = fileSystemAccess.readFileSync(stdInPath, charEncoding);

// Process the acquired string: remove leading/trailing whitespace, then split into an array of lines.
let valueList = (sourceData.trim()).split("\n");

// Start an infinite processing loop.
while (true) {
    // Extract the initial value from the beginning of the list and convert it to a number.
    let mainValue = Number(valueList.shift());

    // If this primary value is zero, it signifies the end of input, so we exit the loop.
    if (mainValue === 0) {
        break;
    }

    // Initialize a secondary accumulator for nine subsequent values.
    let subValue = 0;

    // Iterate exactly nine times to sum up the next nine values from the list.
    for (let loopIndex = 0; loopIndex < 9; loopIndex++) {
        // Take the next value, convert to number, and add it to the secondary accumulator.
        subValue += Number(valueList.shift());
    }

    // Calculate the difference between the primary value and the accumulated secondary values, then print it.
    console.log(mainValue - subValue);
}