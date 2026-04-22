"use strict"; // Activates strict mode for the entire script, enforcing stricter parsing and error handling.

// This core function is responsible for processing the incoming raw text data.
function processInput(rawData) {
  // First, prepare the raw input string by cleaning it up and splitting it.
  const tokenizedData = rawData
    .trim() // Remove any leading or trailing whitespace from the input.
    .split(' '); // Divide the cleaned string into an array of substrings using space as a separator.

  // Extract and parse the key numerical parameters from the tokenized input array.
  const upperLimit = parseInt(tokenizedData[0], 10); // The maximum number to be considered in the sequence.
  const lowerBound = parseInt(tokenizedData[1], 10); // The minimum acceptable sum of digits for a number.
  const upperBound = parseInt(tokenizedData[2], 10); // The maximum acceptable sum of digits for a number.

  // Generate a sequence of numbers from 1 up to 'upperLimit' and then filter them.
  const eligibleNumbers = Array
    .from(new Array(upperLimit), (elementValue, currentIndex) => ++currentIndex) // Creates an array containing integers from 1 to 'upperLimit'.
    .filter((currentNumber) => { // Iterates through each generated number to apply a filtering condition.
      // Calculate the sum of the digits for the current number.
      let digitSum = currentNumber
        .toString() // Convert the numerical value into its string representation.
        .split('') // Break the number-string into an array of individual character digits.
        .reduce((accumulator, currentDigit) => accumulator + parseInt(currentDigit, 10), 0); // Sum up the integer values of each digit.

      // Determine if the calculated digit sum falls within the specified range.
      return (lowerBound <= digitSum && digitSum <= upperBound);
    });

  // Calculate the total sum of all numbers that met the filtering criteria and output the result.
  console.log(eligibleNumbers.reduce((totalSum, currentValue) => totalSum + currentValue, 0));
}

// This is the primary execution block of the script.
// It reads input from standard input and then passes it to the main processing function.
const fileSystemModule = require('fs'); // Obtain the built-in Node.js 'fs' module for file system operations.
processInput(fileSystemModule.readFileSync('/dev/stdin', 'utf8')); // Read the entire content of standard input as a UTF-8 string and pass it to 'processInput'.