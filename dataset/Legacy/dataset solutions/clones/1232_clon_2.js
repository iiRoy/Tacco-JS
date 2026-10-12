let inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of numbers.
let numericValues = inputData.split("\n").map(Number);

// Iterate through the processed numbers and print them with case numbers.
for ( let idx = 0; idx < numericValues.length; idx++) {
    // If a zero is encountered, terminate the processing.
    if (numericValues[idx] == 0) break;
    // Output the current case number and its corresponding value.
    console.log("Case " + (idx+1) + ": " + numericValues[idx]);
}
