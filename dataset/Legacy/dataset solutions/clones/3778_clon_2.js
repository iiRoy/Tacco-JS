"use strict"; // Enforce strict parsing and error handling for better code quality.

const processInput = (inputValue) => {
  // Determine the number of characters in the string representation of the input.
  const numCharacters = inputValue.toString().length;

  // Parse the trimmed input string into an integer.
  let remainingValue = parseInt(inputValue.trim());

  // Initialize a divisor based on the number of characters to extract digits.
  let currentDivisor = Math.pow(10, numCharacters - 1);

  // This array will store the individual digits.
  let digitArray = [];

  // Loop through each character position to extract digits.
  for (let idx = 0; idx < numCharacters; idx++) {
    // Calculate the most significant digit and add it to the array.
    digitArray.push(Math.floor(remainingValue / currentDivisor));

    // Update the remaining value by taking the modulo with the current divisor.
    remainingValue = remainingValue % currentDivisor;

    // Reduce the divisor by a factor of 10 for the next digit.
    currentDivisor /= 10;
  }

  // Sum all the digits in the array using the reduce method.
  let finalSum = digitArray.reduce((accumulator, currentDigit) => accumulator + currentDigit);

  // Special condition: if the sum is 1, change it to 10.
  if (finalSum === 1) {
    finalSum = 10;
  }

  // Output the final calculated sum to the console.
  console.log(finalSum);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
