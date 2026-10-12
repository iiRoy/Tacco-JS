var inputData = []; // Array to store incoming lines of text
var readLineModule = require('readline'); // Import the 'readline' core module

// Create an interface for reading input and writing output
var interfaceHandler = readLineModule.createInterface({
    input: process.stdin,  // Standard input stream
    output: process.stdout, // Standard output stream (not used for direct output in this case, but required by createInterface)
});

// Event listener for each line of input received
interfaceHandler.on('line', function (currentLine) {
    // Add the current line to our collection of input data
    inputData.push(currentLine);
});

// Event listener for when the input stream closes
interfaceHandler.on('close', function () {
    // Parse the first line of input to extract two numerical values
    var firstValue = Number(inputData[0].split(" ")[0]); // Extract the first number
    var secondValue = Number(inputData[0].split(" ")[1]); // Extract the second number

    // Perform a calculation based on the extracted values and print the result
    console.log(Math.pow(2, secondValue) * (1900 * secondValue + 100 * (firstValue - secondValue)));
});
