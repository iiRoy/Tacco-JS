var inputData = [];
var unusedCounter = 0; // This variable is declared but not utilized, preserving the original code's structure.

// Import the 'readline' module to handle input streams.
var readLineModule = require('readline');

// Establish an interface for reading input line by line.
var interfaceHandler = readLineModule.createInterface({
    input: process.stdin,   // Specifies standard input as the source.
    output: process.stdout, // Specifies standard output (though not used for writing in this script).
});

// Declare a variable to store the ultimate computed value.
var finalResult;

// Attach an event listener for each line received from the input.
interfaceHandler.on('line', function (currentLine) {
    // Append the current line of input to our data array.
    inputData.push(currentLine);
});

// Attach an event listener for when the input stream concludes.
interfaceHandler.on('close', function () {
    // Convert the first line of input into a numerical target value.
    var targetValue = Number(inputData[0]);

    // Iterate through a range of potential base numbers, starting from one.
    // The loop continues as long as the current 'loopIndex' does not exceed 'targetValue'.
    for (var loopIndex = 1; loopIndex <= targetValue; loopIndex++) {
        // Evaluate various powers of 'loopIndex' against 'targetValue'.
        // The assignment to 'finalResult' occurs if the power is less than or equal to 'targetValue'.
        // Due to the sequential nature of these 'if' statements (from exponent 10 down to 2),
        // 'finalResult' will ultimately hold the value of 'loopIndex' raised to the smallest exponent (k)
        // such that Math.pow(loopIndex, k) <= targetValue, for the current 'loopIndex'.
        // This process repeats for each 'loopIndex', and the final 'finalResult' will be
        // the value from the largest 'loopIndex' that satisfied any of these conditions.
        if (Math.pow(loopIndex, 10) <= targetValue) { finalResult = Math.pow(loopIndex, 10); }
        if (Math.pow(loopIndex, 9) <= targetValue) { finalResult = Math.pow(loopIndex, 9); }
        if (Math.pow(loopIndex, 8) <= targetValue) { finalResult = Math.pow(loopIndex, 8); }
        if (Math.pow(loopIndex, 7) <= targetValue) { finalResult = Math.pow(loopIndex, 7); }
        if (Math.pow(loopIndex, 6) <= targetValue) { finalResult = Math.pow(loopIndex, 6); }
        if (Math.pow(loopIndex, 5) <= targetValue) { finalResult = Math.pow(loopIndex, 5); }
        if (Math.pow(loopIndex, 4) <= targetValue) { finalResult = Math.pow(loopIndex, 4); }
        if (Math.pow(loopIndex, 3) <= targetValue) { finalResult = Math.pow(loopIndex, 3); }
        if (Math.pow(loopIndex, 2) <= targetValue) { finalResult = Math.pow(loopIndex, 2); }
    }

    // Display the computed final result to the console.
    console.log(finalResult);
});
