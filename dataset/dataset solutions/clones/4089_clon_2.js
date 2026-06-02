var inputHandler = require('readline').createInterface(
    {
        input: process.stdin, // Standard input stream for reading data
        output: process.stdout // Standard output stream for writing data
    }
);

// An array to accumulate all lines read from the input
var inputBuffer = [];

// Attach an event listener for each line received
inputHandler.on('line', (currentLine) => {
    // Add the current line to our collection
    inputBuffer.push(currentLine);
});

// Attach an event listener for when the input stream is closed
inputHandler.on('close', () => {
    // Retrieve the initial line from the buffered input
    var firstLine = inputBuffer[0];

    // Divide the first line into distinct segments using space as a separator
    var segments = firstLine.split(' ');

    // Extract the second and third numerical values from the segments
    // The first segment (index 0) is not used in the calculation
    var valueOne = segments[1]; // Represents the first operand
    var valueTwo = segments[2]; // Represents the second operand

    // Compute the crucial difference value
    var calculatedDifference = valueTwo - valueOne - 1;

    // Evaluate the parity of the calculated difference to determine the outcome
    if (calculatedDifference % 2 === 1) {
        // If the remainder is 1, it's an odd number
        console.log('Alice');
    } else if (calculatedDifference % 2 === 0) {
        // If the remainder is 0, it's an even number
        console.log('Borys');
    }
    // No other conditions are specified, preserving original logic
});
