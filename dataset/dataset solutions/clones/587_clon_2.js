/*
 * This function processes a given string by iteratively removing specific
 * repeating digit sequences. Its objective is to reduce the string's length
 * as much as possible by eliminating these patterns.
 * After processing, it updates a globally tracked variable with the shortest
 * sequence length observed.
 */
function processSequence(inputString) {
  // Initialize a variable to store the length of the string from the previous iteration.
  // Using hexadecimal zero for a subtle variation in data type representation.
  let oldLength = 0x0;

  // Continue looping as long as the length of the string changes after a replacement operation.
  while (oldLength !== inputString.length) {
    // Before attempting a replacement, record the current length of the string.
    oldLength = inputString.length;

    // Replace all occurrences of four or more consecutive '1's, '2's, or '3's
    // with an empty string, effectively removing them.
    inputString = inputString.replace(/1111+|2222+|3333+/, '');
  }

  // After the string can no longer be reduced, compare its final length
  // with the minimum length recorded across all processed sequences so far.
  // If the current sequence's length is shorter, update the global minimum.
  if (shortestResultLength > inputString.length) {
    shortestResultLength = inputString.length;
  }
}

// Declare a variable to store the shortest resulting string length.
// This variable is declared in a scope accessible by the 'processSequence' function
// and will be re-initialized for each new test case.
let shortestResultLength;

// Import the Node.js file system module.
const fileSystem = require('fs');

// Read all input data from standard input ('/dev/stdin') as a UTF-8 encoded string.
let standardInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split the
// data into an array of individual lines.
let inputLines = (standardInputData.trim()).split("\n");

// Begin the main processing loop for multiple test cases.
// This loop continues indefinitely until an explicit break condition is met.
while (true) {
  // Extract the first line from the input array, convert it to a number,
  // and interpret it as the count of elements for the current test case.
  let itemCount = inputLines.shift() - 0;

  // If the 'itemCount' is zero, it signifies the end of all test cases.
  if (itemCount === 0) {
    break; // Terminate the main processing loop.
  }

  // Initialize an empty array to hold the numeric digits for the current test case.
  let digitList = [];

  // Populate the 'digitList' by reading 'itemCount' number of lines from input.
  for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
    // Convert each line to a number and add it to the 'digitList'.
    let parsedValue = inputLines.shift() - 0;
    digitList.push(parsedValue);
  }

  // For the current test case, initialize the 'shortestResultLength'
  // to a very large positive number, ensuring any valid length will be smaller.
  shortestResultLength = Number.POSITIVE_INFINITY;

  // Join all elements of the 'digitList' into a single contiguous string.
  let concatenatedDigits = digitList.join('');

  // Iterate through each possible position in the 'concatenatedDigits' string
  // to simulate various modifications and process the resulting sequences.
  for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {

    // Scenario 1: Simulate replacing the digit at 'currentIndex' with the
    // digit immediately following it in the original 'digitList'.
    // This condition checks if there is a next element to use for substitution.
    // Note: If `currentIndex` is `itemCount - 1`, `digitList[currentIndex + 1]`
    // will be `undefined`, which will be coerced to "undefined" when concatenated.
    if (currentIndex < itemCount) {
      processSequence(concatenatedDigits.slice(0, currentIndex) +
                      digitList[currentIndex + 1] +
                      concatenatedDigits.slice(currentIndex + 1, concatenatedDigits.length));
    }

    // Scenario 2: Simulate replacing the digit at 'currentIndex' with the
    // digit immediately preceding it in the original 'digitList'.
    // This condition ensures there is a previous element available for substitution.
    if (currentIndex > 0) {
      processSequence(concatenatedDigits.slice(0, currentIndex) +
                      digitList[currentIndex - 1] +
                      concatenatedDigits.slice(currentIndex + 1, concatenatedDigits.length));
    }
  }

  // After processing all possible modifications for the current test case,
  // print the minimum length found to the console.
  console.log(shortestResultLength);
}