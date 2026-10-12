'use strict';

// This function processes the raw input data.
function processInputData(rawData) {
  const inputLines = rawData.split('\n'); // Split the input string by newline characters.

  inputLines.pop(); // Remove the last element, which might be an empty string if the input ends with a newline.

  inputLines.forEach(currentLine => {
    const parts = currentLine.split(' '); // Split each line by space to get two string parts.
    const firstNum = parseInt(parts[0], 10); // Parse the first part as an integer (base 10).
    const secondNum = parseInt(parts[1], 10); // Parse the second part as an integer (base 10).

    calculateAndPrintRange(firstNum, secondNum); // Call the helper function with the parsed numbers.
  });
}

// This function calculates and prints a range of numbers based on the given parameters.
function calculateAndPrintRange(firstNum, secondNum) {
  const rangeOffset = firstNum - 1; // Determine the offset for the range calculation.

  const lowerBound = -1000000; // Define the absolute minimum allowed value.
  const upperBound = 1000000; // Define the absolute maximum allowed value.

  let effectiveMin = secondNum - rangeOffset; // Calculate the initial minimum for the output range.
  let effectiveMax = secondNum + rangeOffset; // Calculate the initial maximum for the output range.

  // Adjust the effective minimum if it falls below the absolute lower bound.
  if (effectiveMin < lowerBound) {
    effectiveMin = lowerBound;
  }

  // Adjust the effective maximum if it exceeds the absolute upper bound.
  if (effectiveMax > upperBound) {
    effectiveMax = upperBound;
  }

  // Iterate from the adjusted minimum to the adjusted maximum and print each number.
  for (let currentValue = effectiveMin; currentValue <= effectiveMax; currentValue++) {
    console.log(currentValue);
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
