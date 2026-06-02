process.stdin.resume(); // Ensure standard input stream remains open
process.stdin.setEncoding('utf8'); // Set the character encoding for input

// Declare an array to store incoming lines of text
let inputData = [];

// Initialize a readline interface for handling input/output
const inputHandler = require('readline').createInterface({
  input: process.stdin,   // Use standard input as the source
  output: process.stdout  // Use standard output for any prompts (though none are used here)
});

// Attach an event listener for each new line received
inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the current line to our collection
});

// Attach an event listener for when the input stream closes
inputHandler.on('close', () => {
  // Process the collected input data
  // The problem implies only one line of space-separated numbers
  inputData = inputData[0].split(' ').map(Number); // Convert the first line into an array of numbers

  // Find the smallest number in the array
  let smallestValue = Math.min(...inputData);

  // Filter out all occurrences of the smallest number
  inputData = inputData.filter(element => element !== smallestValue);

  // Find the second smallest number from the remaining elements
  let secondSmallestValue = Math.min(...inputData);
  
  // Output the sum of the smallest and second smallest values
  console.log(smallestValue + secondSmallestValue);
});
