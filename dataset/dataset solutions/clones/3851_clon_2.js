'use strict'; // Enforce strict mode for robust code execution

function executeProgram(receivedContent) {
  // Split the entire incoming text by newline characters
  // This separates distinct lines of data provided as input
  receivedContent = receivedContent.split('\n');

  // Process the first line:
  // 1. Split it by spaces to get individual number strings.
  // 2. Use the map function to convert each string to an integer.
  // The '~~' operator is a concise way to perform a bitwise NOT operation twice,
  // effectively truncating decimal parts and converting to a 32-bit integer.
  receivedContent[0] = receivedContent[0]
    .split(' ')
    .map(numStr => ~~numStr);

  // Convert the second line of the received content directly into an integer.
  receivedContent[1] = ~~receivedContent[1];

  // Sort the array of numbers obtained from the first line in ascending order.
  // This ensures that the largest number will be at the end of the array.
  receivedContent[0] = receivedContent[0]
    .sort((valA, valB) => valA - valB);

  // Determine the index of the last element in the now sorted array.
  // This element is guaranteed to be the largest.
  const highestIdx = receivedContent[0].length - 1;

  // Modify the largest element in the array:
  // Multiply it by a factor of two times the second input value.
  receivedContent[0][highestIdx] = receivedContent[0][highestIdx] * (2 * receivedContent[1]);

  // Calculate the sum of all elements in the modified array.
  // The reduce method iterates through the array, accumulating the total.
  let calculatedTotal = receivedContent[0]
    .reduce((currentSum, currentVal) => currentSum + currentVal);

  // Output the final computed sum to the standard console.
  console.log(calculatedTotal);
}

// Main execution block:
// Read the input from the standard input stream (e.g., /dev/stdin on Unix-like systems)
// using Node.js's file system module and pass it to our processing function.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));