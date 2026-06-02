"use strict"; // Enforce strict mode for cleaner code execution

/**
 * Processes input to find numbers within a range whose digit sums fall within another specified range.
 *
 * @param {string} rawData - The raw input string containing space-separated numbers.
 */
function processInput(rawData) {
  // Split the input string into individual parameters
  const parameters = rawData.trim().split(' ');

  // Parse the numerical values from the parameters
  const upperBound = parseInt(parameters[0], 10); // The upper limit for numbers to consider
  const lowerSumLimit = parseInt(parameters[1], 10); // The lower bound for the sum of digits
  const upperSumLimit = parseInt(parameters[2], 10); // The upper bound for the sum of digits

  // Generate an array of numbers from 1 up to 'upperBound',
  // then filter them based on their digit sum.
  const filteredNumbers = Array.from(new Array(upperBound), (_, idx) => idx + 1).filter((currentNum) => {
    // Calculate the sum of digits for the current number
    let digitSum = currentNum.toString().split('').reduce((accumulator, digitChar) => {
      return accumulator + parseInt(digitChar, 10);
    }, 0);

    // Check if the calculated digit sum is within the specified range
    return (lowerSumLimit <= digitSum && digitSum <= upperSumLimit);
  });

  // Sum all the numbers that passed the filter condition
  const finalSumResult = filteredNumbers.reduce((totalSum, numberToAdd) => totalSum + numberToAdd, 0);

  // Output the final calculated sum to the console
  console.log(finalSumResult);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
