var inputData = require('fs') .readFileSync('/dev/stdin', 'utf8'); // Read input from standard input

// Split the input string into an array of lines
var linesArray = inputData.split('\n');

// Iterate through each line of the input
for ( var idx = 0, maxIdx = linesArray.length; idx < maxIdx; idx++ ) {
    // Calculate the current case number (1-based index)
    var caseNumber = idx + 1;

    // Output the case number and the corresponding line content
    console.log('Case ' + caseNumber + ':' + linesArray[idx]);
}
