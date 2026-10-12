var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
let lineSegments = rawData.split("\n"); // Split the input into an array of lines

// Iterate through each line segment
for (let idx = 0; idx < lineSegments.length; idx++) {
    // Parse height and width from the current line
    let dimensions = lineSegments[idx].split(" ").map(Number);
    let heightVal = dimensions[0];
    let widthVal = dimensions[1];

    // If both height and width are zero, terminate the program
    if (heightVal === 0 && widthVal === 0) {
        break;
    }

    let outputBuffer = ''; // Initialize an empty string to build the pattern

    // Loop for each row
    for (let rowIter = 0; rowIter < heightVal; rowIter++) {
        // Loop for each column
        for (let colIter = 0; colIter < widthVal; colIter++) {
            // Check if it's the first or last row
            if (rowIter === 0 || rowIter === heightVal - 1) {
                outputBuffer += '#'; // Add a hash for border
            } else {
                // For inner rows, check if it's the first or last column
                if (colIter === 0 || colIter === widthVal - 1) {
                    outputBuffer += '#'; // Add a hash for border
                } else {
                    outputBuffer += '.'; // Add a dot for the interior
                }
            }
        }
        outputBuffer += '\n'; // Add a newline character at the end of each row
    }
    console.log(outputBuffer); // Print the constructed pattern for the current dimensions
}
