var inputHandler = require('readline').createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout // Standard output stream
});

// Array to store all lines read from input
var inputLines = [];

// Event listener for each line of input
inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine); // Add the current line to our collection
});

// Event listener for when the input stream closes
inputHandler.on('close', function () {
    // The first line of input contains space-separated numbers
    var stringParts = inputLines[0].split(" ");

    // Array to hold the parsed integer values
    var numericValues = [];
    var resultCounter = 0; // Initialize a counter for the result

    // Parse string parts into integers
    for (var idx = 0; idx < stringParts.length; idx++) {
        numericValues[idx] = parseInt(stringParts[idx], 10); // Base 10 for safety
    }

    // Iterate from the first number to the second number (inclusive)
    // and check for divisibility by the third number
    for (var loopVar = numericValues[0]; loopVar <= numericValues[1]; loopVar++) {
        // If the current number is perfectly divisible by the third number
        if (!(loopVar % numericValues[2])) {
            resultCounter++; // Increment the counter
        }
    }

    // Output the final count to the console
    console.log(resultCounter);
});
