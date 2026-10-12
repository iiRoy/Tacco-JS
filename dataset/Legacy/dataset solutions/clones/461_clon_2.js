let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
let lineData = (rawData.trim()).split("\n"); // Process raw data: remove leading/trailing whitespace, then split into an array of lines

// Begin an infinite processing loop
for (;;) {
    // Extract the first numerical entry from the array and convert it to a number
    let currentNum = lineData.shift() - 0;

    // Check for the termination condition: if the number is zero, exit the loop
    if (currentNum === 0) {
        break;
    }

    // Convert the current number into its octal string representation
    let processedString = currentNum.toString(8) + '';

    // Apply a series of character substitutions to the octal string
    // Replace all occurrences of '7' with '9'
    processedString = processedString.replace(/7/g, "9");
    // Replace all occurrences of '6' with '8'
    processedString = processedString.replace(/6/g, "8");
    // Replace all occurrences of '5' with '7'
    processedString = processedString.replace(/5/g, "7");
    // Replace all occurrences of '4' with '5'
    processedString = processedString.replace(/4/g, "5");

    // Display the final modified string to the console
    console.log(processedString);
}
