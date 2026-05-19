var inputData = []; // Array to accumulate lines read from standard input.
var ioHandler = require('readline'); // Import the 'readline' module for I/O operations.

// Create an interface for reading input line by line.
var inputReader = ioHandler.createInterface({
    input: process.stdin,  // Specify standard input as the source.
    output: process.stdout // Specify standard output (though not directly written to by this interface).
});

// Attach an event listener for each line received.
inputReader.on('line', function (currentLine) {
    // Add the current line string to our collection.
    inputData.push(currentLine);
});

// Attach an event listener for when the input stream closes.
inputReader.on('close', function () {
    // Convert the first line of input to a number; this is our primary value.
    var targetNum = Number(inputData[0]);
    // Initialize a variable to store the computed sum.
    var resultCount = 0;

    // The problem statement implies a relationship N = k * m + k, which simplifies to N = k * (m + 1).
    // We are looking for integer values of 'k' and 'm'.
    // This means 'k' must be a divisor of 'N'.
    // From N = k * (m + 1), we can derive m = (N / k) - 1.
    // The loop iterates through possible integer factors 'k' up to the square root of 'N'.
    for (var factorVar = 1; factorVar < Math.sqrt(targetNum); factorVar++) {
        // Check if 'factorVar' is a perfect divisor of 'targetNum'.
        // Also, ensure that 'factorVar' is not equal to 'm' (which is 'targetNum / factorVar - 1').
        if (targetNum / factorVar === Math.floor(targetNum / factorVar) && factorVar !== targetNum / factorVar - 1) {
            // If both conditions are met, add the value of 'm' to our result count.
            resultCount += targetNum / factorVar - 1;
        }
    }

    // Print the final calculated result to the console.
    console.log(resultCount);
});
