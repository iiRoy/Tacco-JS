var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input as a UTF-8 string

var dataRows = rawData.split('\n'); // Split the entire input string into an array of lines

// Begin an infinite loop to process multiple test cases
while (true) {
    // Extract the first line from the array, split it by space, and store the parts
    var dimensionsArray = dataRows.shift().split(' ');

    // Convert the first part to a number for height
    var heightVal = +dimensionsArray[0];
    // Convert the second part to a number for width
    var widthVal = +dimensionsArray[1];

    // Check the termination condition: if both height and width are zero
    if (heightVal + widthVal === 0) {
        break; // Exit the loop if the sum is zero
    }

    // Iterate through each row to construct the pattern
    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // Iterate through each column within the current row
        for (var colIdx = 0; colIdx < widthVal; colIdx++) {
            // Determine the character to print based on the sum of row and column indices
            if ((rowIdx + colIdx) % 2 === 0) {
                process.stdout.write('#'); // Print '#' for even sums
            } else {
                process.stdout.write('.'); // Print '.' for odd sums
            }
        }
        console.log(); // Move to the next line after completing a row
    }
    console.log(); // Print an additional blank line after each complete pattern
}
