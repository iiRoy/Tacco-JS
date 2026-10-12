(function () {
  'use strict';

  // Import the Node.js file system module
  const fileSystem = require('fs');

  // Read all input from standard input as UTF-8 text
  let inputData = fileSystem.readFileSync('/dev/stdin', 'utf-8');

  /**
   * Processes raw input data to find the minimum, maximum, and sum of numbers.
   * @param {string} rawData - The raw string content read from input.
   */
  const analyzeNumbers = function (rawData) {
    // Split the input into individual lines and clean up whitespace
    const inputLines = rawData.trim().split("\n");

    // Parse the first line to get the count of elements (though not strictly used in logic)
    const countOfElements = parseInt(inputLines[0].trim(), 10);

    // Get the second line, split it by spaces, and clean up each part
    const stringNumbers = inputLines[1].trim().split(" ");

    // Initialize variables for tracking min, max, and sum
    let minimumValue = 1000000; // A sufficiently large initial value for minimum
    let maximumValue = -1000000; // A sufficiently small initial value for maximum
    let totalSum = 0;

    // Iterate through the array of string numbers
    for (let idx = 0; idx < stringNumbers.length; idx++) {
      // Convert the current string number to an integer
      const currentNumber = parseInt(stringNumbers[idx], 10);

      // Update maximumValue if the current number is greater
      if (currentNumber > maximumValue) {
        maximumValue = currentNumber;
      }

      // Update minimumValue if the current number is smaller
      if (currentNumber < minimumValue) {
        minimumValue = currentNumber;
      }

      // Add the current number to the total sum
      totalSum += currentNumber;
    }

    // Output the calculated minimum, maximum, and sum, separated by spaces
    console.log(minimumValue + " " + maximumValue + " " + totalSum);
  };

  // Execute the analysis function with the collected input data
  analyzeNumbers(inputData);
})();
