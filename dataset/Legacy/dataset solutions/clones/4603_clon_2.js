"use strict";

const executeLogic = (inputData) => {
  // Process the raw input string
  inputData = inputData.trim().split("\n");

  // Parse the three integer values from the first line
  const factorOne = parseInt(inputData[0].split(" ")[0]);
  const moduloDivisor = parseInt(inputData[0].split(" ")[1]);
  const desiredRemainder = parseInt(inputData[0].split(" ")[2]);

  let finalOutcome = "NO"; // Initialize the result flag

  // Iterate from 0 up to (but not including) moduloDivisor
  for (let iterationCount = 0; iterationCount < moduloDivisor; iterationCount++) {
    // Calculate the current remainder
    let calculatedRemainder = (factorOne * iterationCount) % moduloDivisor;
    // This line was previously used for debugging: console.log(calculatedRemainder);

    // Check if the calculated remainder matches the desired value
    if (calculatedRemainder === desiredRemainder) {
      finalOutcome = "YES"; // Set the flag to "YES" if a match is found
      break; // Exit the loop early as the condition is met
    }
  }

  // Output the final determination
  console.log(finalOutcome);
};

// Read input from standard input and pass it to the main processing function
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
