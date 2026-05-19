'use strict';

// This function processes the raw input data to determine contestant outcomes.
function processInputData(rawData) {
  // Split the input string into an array of lines, after trimming any leading/trailing whitespace.
  const linesArray = rawData.trim().split('\n');

  // Parse the first line to extract numeric parameters.
  // It splits by space and converts each part to a number.
  const numericParams = linesArray[0].split(' ').map(valStr => Number(valStr));

  // The second line contains the contestant types as a string, split into individual characters.
  const contestants = linesArray[1].split('');

  // An array to store the 'Yes' or 'No' result for each contestant.
  const resultFlags = [];

  // Counter for 'b' type foreign contestants encountered in the inner loop.
  let foreignContestantCount = 0x0; // Using hexadecimal literal for 0

  // Iterate through each contestant to determine their pass/fail status.
  for (let idx = 0; idx < contestants.length; idx++) {
    // Check the type of the current contestant.
    if (contestants[idx] === 'a') {
      // For 'a' type contestants, check if their index (plus one) is within the combined limit.
      if (idx + 1 < numericParams[1] + numericParams[2]) {
        resultFlags[idx] = 'Yes\n'; // Contestant passes.
        continue; // Move to the next contestant.
      } else {
        resultFlags[idx] = 'No\n'; // Contestant fails.
      }
    } else if (contestants[idx] === 'b') {
      // For 'b' type contestants, count previous 'b' types.
      for (let innerIdx = 0x0; innerIdx < idx; innerIdx++) { // Using hexadecimal literal for 0
        if (contestants[innerIdx] === 'b') {
          foreignContestantCount++; // Increment count of foreign 'b' contestants.
        }
      }

      // Check if the contestant's index (plus one) is within the combined limit AND
      // if their index (plus one) is less than the count of previous foreign 'b' contestants.
      if (idx + 1 < numericParams[1] + numericParams[2] && idx + 1 < foreignContestantCount) {
        resultFlags[idx] = 'Yes\n'; // Contestant passes.
        continue; // Move to the next contestant.
      } else {
        resultFlags[idx] = 'No\n'; // Contestant fails.
      }
      foreignContestantCount = 0; // Reset the counter for the next 'b' contestant check.
    } else {
      // Any other contestant type automatically fails.
      resultFlags[idx] = 'No\n';
      continue; // Move to the next contestant.
    }
    // Output the result for the current contestant.
    console.log(resultFlags[idx]);
  }
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
