// This function is designed to process a sequence of numbers,
// printing pairs in ascending order until a specific termination condition is met.
function processInputData(inputArray) {
  // Initialize an index to traverse the input array.
  let currentIndex = 0;

  // The loop continues as long as the current pair of numbers is not '0 0'.
  // It checks if both the current number and the next number are non-zero.
  while (inputArray[currentIndex] !== 0 && inputArray[currentIndex + 1] !== 0) {
    // Determine the order for printing the current pair of numbers.
    if (inputArray[currentIndex] < inputArray[currentIndex + 1]) {
      // If the first number is smaller, print it followed by the second.
      console.log(inputArray[currentIndex] + " " + inputArray[currentIndex + 1]);
    } else {
      // Otherwise, print the second number followed by the first.
      console.log(inputArray[currentIndex + 1] + " " + inputArray[currentIndex]);
    }
    // Advance the index by two to move to the next pair of numbers.
    currentIndex = currentIndex + 2;
  }
}

// An array to store raw input lines, though it's not actively used in this specific implementation.
let inputLines = [];
// This array will accumulate all numeric values parsed from the input,
// storing them sequentially as they are read.
let numericDataBuffer = [];

// Create a readline interface to handle input from the standard input stream.
// This allows the program to read data line by line.
const lineReader = require('readline').createInterface({
  input: process.stdin,  // Specifies standard input as the source.
  output: process.stdout // Specifies standard output for any prompts (not used here).
});

// Attach an event listener for each line received from the input.
lineReader.on('line', function (currentLine) {
  // Split the incoming line string into an array of strings based on spaces.
  const stringParts = currentLine.split(' ');
  // Parse the first string part into an integer, specifying base 10.
  const firstNumber = parseInt(stringParts[0], 10);
  // Parse the second string part into an integer, specifying base 10.
  const secondNumber = parseInt(stringParts[1], 10);

  // Add the parsed numbers to our buffer array.
  numericDataBuffer.push(firstNumber);
  numericDataBuffer.push(secondNumber);

  // Check if the current pair of numbers signifies the end of input (0 0).
  if (firstNumber === 0 && secondNumber === 0) {
    // If it's the termination pair, call the main processing function
    // with all the accumulated numeric data.
    processInputData(numericDataBuffer);
  }
});

// Attach an event listener for when the standard input stream ends.
// For this particular script, no specific action is required upon stream termination,
// as processing is triggered by the '0 0' input.
process.stdin.on('end', function () {
  // No further operations are needed here.
});
