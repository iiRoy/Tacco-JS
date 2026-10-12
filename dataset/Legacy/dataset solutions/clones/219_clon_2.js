var fileSystem = require('fs'); // Import the file system module

// Determine the size of the standard input stream
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a string, trim whitespace, and split into lines
var linesOfInput = inputBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Execute the primary data processing function
processInputData();

/**
 * Main function to process each line of input.
 * It calculates the sum of the first N decimal digits of a division.
 */
function processInputData() {
  // Iterate through each line provided in the input
  for (var lineIndex = 0, totalLines = linesOfInput.length; lineIndex < totalLines; lineIndex++) {
    // Split the current line by space to get individual parts
    var currentLineParts = linesOfInput[lineIndex].split(' ');

    // Perform division and convert the result to a string
    var divisionResultStr = currentLineParts[0] / currentLineParts[1] + '';

    // Extract the decimal part, then split it into an array of individual digit characters
    var decimalDigitsArr = divisionResultStr.split('.')[1].split('');

    // Initialize a variable to accumulate the sum of digits
    var sumOfDigits = 0;

    // Loop through the specified number of decimal digits
    for (var digitIndex = 0; digitIndex < +currentLineParts[2]; digitIndex++) {
      // Convert the current digit character to a number
      var currentDigitVal = +decimalDigitsArr[digitIndex];
      // Add the digit's value to the sum, handling potential NaN by adding 0
      sumOfDigits += currentDigitVal ? currentDigitVal : 0;
    }

    // Output the calculated sum for the current line
    console.log(sumOfDigits);
  }
}
