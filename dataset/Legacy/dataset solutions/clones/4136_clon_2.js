'use strict';

// This function processes the raw input string to calculate a specific sum.
let processInput = (rawData) => {
  // First, split the input string by spaces and convert each part to a number.
  let parsedNumbers = rawData.split(' ').map((numStr) => +numStr);

  // Initialize a variable to store the final accumulated result.
  let finalResult = 0;

  // Iterate from 1 up to the first number provided in the input.
  for (let idx = 1; idx <= parsedNumbers[0]; idx++) {
    // Convert the current iteration number to a string, then split it into individual digit characters.
    // Reduce these characters by converting them back to numbers and summing them up.
    const digitSum = String(idx)
      .split('')
      .reduce((currentSum, digitChar) => currentSum + +digitChar, 0);

    // Check if the calculated digit sum falls within the specified range (inclusive).
    // The range is defined by the second and third numbers from the input.
    if (digitSum >= parsedNumbers[1] && digitSum <= parsedNumbers[2]) {
      // If it does, add the current iteration number to our final result.
      finalResult += idx;
    }
  }
  // Return the total sum accumulated.
  return finalResult;
};

// The main entry point function for the application.
function AppEntry(fileContent) {
  // Execute the processing logic with the provided file content
  // and print the returned value to the console.
  console.log(processInput(fileContent));
}

// Read the entire content from standard input synchronously and pass it to the main entry function.
AppEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
