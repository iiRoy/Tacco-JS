'use strict';

// This function processes the raw input data to determine a specific rank.
function processInput(rawData) {
  // Extract the first numerical value from the input string.
  // The input is expected to be a single line, with numbers separated by spaces.
  const scoreValue = Number(rawData.split('\n')[0].split(' ')[0]);

  // The following lines are commented out in the original code,
  // indicating they might be unused or for future expansion.
  // let r_unused = Number(rawData.split('\n')[0].split(' ')[1]);
  // let d_unused = Number(rawData.split('\n')[0].split(' ')[2]);

  let resultRank; // Declare a variable to hold the computed rank.

  // Apply a series of conditional checks to assign a rank based on the 'scoreValue'.
  // Each 'if-else if' block defines a specific range for the score and its corresponding rank.
  if (scoreValue >= 400 && scoreValue < 600) {
    resultRank = 8;
  } else if (scoreValue >= 600 && scoreValue < 800) {
    resultRank = 7;
  } else if (scoreValue >= 800 && scoreValue < 1000) {
    resultRank = 6;
  } else if (scoreValue >= 1000 && scoreValue < 1200) {
    resultRank = 5;
  } else if (scoreValue >= 1200 && scoreValue < 1400) {
    resultRank = 4;
  } else if (scoreValue >= 1400 && scoreValue < 1600) {
    resultRank = 3;
  } else if (scoreValue >= 1600 && scoreValue < 1800) {
    resultRank = 2;
  } else if (scoreValue >= 1800 && scoreValue < 2000) {
    resultRank = 1;
  }

  // Output the final calculated rank to the standard console.
  console.log(resultRank);
}

// Invoke the main processing function with data read from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
