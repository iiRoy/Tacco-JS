// This script processes a single line of input containing two space-separated numbers.
// It then calculates and prints their product and twice their sum.

let inputDataCollection = []; // Array to store all incoming lines from standard input.

// Set up the interface for reading input from the console.
const inputHandler = require('readline').createInterface({
  input: process.stdin,  // Specifies standard input as the source.
  output: process.stdout // Specifies standard output for any prompts (though none are used here).
});

// When a new line of text is received from input, add it to our collection.
inputHandler.on('line', function (currentLineText) {
  inputDataCollection.push(currentLineText);
});

// Once the entire input stream has ended, execute the main processing logic.
process.stdin.on('end', function () {
  processInputAndDisplay(inputDataCollection);
});

// Function to perform the core logic: parse input and print results.
function processInputAndDisplay(receivedData) {
  // The first element of the received data array is expected to be the line with numbers.
  let parsedNumbersArray = receivedData[0].split(' ');

  // Extract the two numbers, converting them from strings to actual numbers.
  let firstValue = +parsedNumbersArray[0];
  let secondValue = +parsedNumbersArray[1];

  // Calculate the product and the "perimeter" (sum multiplied by two), then output.
  console.log(firstValue * secondValue + ' ' + (firstValue + secondValue) * 2);
}
