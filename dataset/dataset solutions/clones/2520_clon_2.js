process.stdin.resume();
process.stdin.setEncoding('utf8');

// This array will hold all the lines read from standard input.
let inputData = [];

// Create a readline interface to process input line by line.
const lineProcessor = require('readline').createInterface({
    input: process.stdin, // Use the standard input stream.
    output: process.stdout // Standard output (not directly used for writing by readline here).
});

// Event handler for each line received from input.
lineProcessor.on('line', (currentLine) => {
    // Add the current line to our collection of input data.
    inputData.push(currentLine);
});

// Event handler for when the input stream ends.
lineProcessor.on('close', () => {
    // All input has been gathered; now perform the main computation.
    const inputNum = Number(inputData[0]); // Convert the very first line of input to a numerical value.

    // Calculate the result using the specified formula and print it to the console.
    console.log((inputNum + (inputNum % 2)) / (2 * inputNum));

    // The following block was commented out in the original code and remains so.
    // for (let idx = 0; idx < inputData.length; idx++) {
    //     console.log(inputData[idx]);
    // }
});
