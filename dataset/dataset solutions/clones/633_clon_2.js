var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = rawData.trim().split("\n");

// The first line, which might contain dimensions (e.g., "H W"), is extracted
// but its value is not utilized in the subsequent logic of this script.
var dimensionsStr = lineCollection.shift();

// This array will store the calculated distances for each character in each line.
var resultMatrix = [];

// Iterate over each line of the input data.
lineCollection.forEach(function(currentLine, lineIdx) {
    // Initialize a new sub-array for the current line's results.
    resultMatrix[lineIdx] = [];

    // Convert the current line string into an array of individual characters for easier processing.
    var charArray = currentLine.split("");

    // Initialize a variable to track the distance from the last encountered 'c'.
    // A value of -1 indicates that no 'c' has been found yet in the current scan direction.
    var cloudDistance = -1;

    // Loop through each character in the current line from left to right.
    for (var charIdx = 0; charIdx < charArray.length; charIdx++) {
        // If the current character is 'c' (representing a cloud).
        if (charArray[charIdx] === "c") {
            resultMatrix[lineIdx].push(0); // The distance to a cloud from itself is 0.
            cloudDistance = 1; // Reset the distance counter for subsequent '.' characters.
        }
        // If the current character is '.' (empty space) and no 'c' has been encountered yet.
        else if (charArray[charIdx] === "." && cloudDistance === -1) {
            resultMatrix[lineIdx].push(cloudDistance); // Push -1, indicating no cloud found so far.
        }
        // If the current character is '.' and a 'c' has been encountered previously.
        else if (charArray[charIdx] === "." && cloudDistance !== -1) {
            resultMatrix[lineIdx].push(cloudDistance); // Push the current calculated distance.
            cloudDistance++; // Increment the distance for the next empty space.
        }
    }
});

// Format the final output:
// - Join the inner arrays (rows) with spaces (replacing default commas).
// - Join the outer array (all rows) with newline characters.
console.log(resultMatrix.join("\n").replace(/,/g, " "));
