var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Process raw data: remove leading/trailing whitespace, then split into an array of lines
var numIterations = lineSegments.shift() - 0; // Extract the first line, convert it to a numeric value, and store it as the iteration count
var processedSequence = ""; // Initialize an empty string to build the sequence

// Iterate through the remaining lines based on the extracted iteration count
for (var idx = 0; idx < numIterations; idx++) {
    var currentParts = lineSegments[idx].split(" "); // Split the current line into two parts based on space
    var charToRepeat = currentParts[0]; // The first part is the character or string to be repeated
    var repeatCount = currentParts[1] - 0; // The second part is the number of times to repeat, converted to a number
    // Append the repeated character/string to the main sequence string
    processedSequence += Array(repeatCount + 1).join(charToRepeat);
}

// Continuously remove all occurrences of "()" from the sequence until no more are found
while (processedSequence.match(/\(\)/)) {
    processedSequence = processedSequence.replace(/\(\)/g, ""); // Replace all "()" with an empty string
}

// Check the final state of the processed sequence and output the result
if (processedSequence === "") {
    console.log("YES"); // If the sequence is empty, print "YES"
} else {
    console.log("NO"); // Otherwise, print "NO"
}
