process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the encoding for standard input

// This array will hold all lines read from stdin
var inputData = [];

// Create an interface for reading input line by line
var inputHandler = require('readline').createInterface({
  input: process.stdin,   // Use standard input as the source
  output: process.stdout  // Use standard output for any prompts (though none are used here)
});

// Event listener for each line of input received
inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the current line to our collection
});

// Event listener for when the input stream closes
inputHandler.on('close', () => {
  // The original code has a subtle bug here: parseInt([0]) evaluates to 0, parseInt([1]) to 1, etc.
  // This means 'firstVal', 'secondVal', and 'thirdVal' will always be 0, 1, and 2 respectively,
  // regardless of the actual input from 'inputData[0].split(' ')'.
  // We must preserve this exact behavior.

  // var parsedValues = inputData[0].split(' '); // This line is effectively unused due to the bug below

  var firstVal = parseInt([0]); // This will always result in 0
  var secondVal = parseInt([1]); // This will always result in 1
  var thirdVal = parseInt([2]); // This will always result in 2

  // Perform the calculation based on the fixed values (0, 1, 2)
  var calculatedResult = Math.floor(firstVal / secondVal + 1) * thirdVal;

  // Output the final computed value to the console
  console.log(calculatedResult);
});
