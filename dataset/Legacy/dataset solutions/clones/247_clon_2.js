var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire input from standard input
var dataRows = rawData.split('\n'); // Split the input string into an array of lines

var currentLine; // Declare a variable to hold the current line being processed
while (currentLine = dataRows.shift()) { // Loop through each line of input until no more lines are available
    // Convert the current line (string of digits) into an array of numbers
    var digitArray = currentLine.split('').map(function(digitChar) {
        return +digitChar; // Convert each character digit to a number
    });

    var arrayLength = digitArray.length; // Get the initial count of digits in the array

    // This inner loop continues until only one digit remains in the array
    while (arrayLength > 1) {
        var tempArray = []; // Initialize a temporary array to store results of the current reduction step

        // Iterate through the current digit array, summing adjacent elements
        for (var idx = 0; idx < arrayLength - 1; idx++) {
            // Sum the current digit and the next one, then take the result modulo 10
            tempArray.push((digitArray[idx] + digitArray[idx + 1]) % 10);
        }

        arrayLength--; // Decrement the length for the next iteration (as one element is removed in each step)
        digitArray = tempArray; // Replace the original array with the newly computed one
    }

    // After the reduction, print the single remaining digit
    console.log(digitArray[0]);
}
