'use strict';

function processInput(rawData) {
  // Split the raw input string into an array of lines
  const linesArray = rawData.trim().split('\n');

  // Parse the first line to get configuration parameters
  // The first line contains space-separated numbers
  const configParams = linesArray[0].split(' ').map(numStr => Number(numStr));

  // Get the list of contestants from the second line
  // Each character represents a contestant type
  const contestants = linesArray[1].split('');

  // Initialize an array to store the pass/fail status for each contestant
  const passStatusList = [];

  // Initialize a counter for foreign contestants encountered so far
  let foreignCount = 0;

  // Iterate through each contestant to determine their pass status
  for (let idx = 0; idx < contestants.length; idx++) {
    // Check if the current contestant is of type 'a'
    if (contestants[idx] === 'a') {
      // If the current contestant's index (plus one for 1-based counting)
      // is less than the sum of the second and third config parameters, they pass.
      if (idx + 1 < configParams[1] + configParams[2]) {
        passStatusList[idx] = true;
        continue; // Move to the next contestant
      } else {
        // Otherwise, they fail.
        passStatusList[idx] = false;
      }
    } else if (contestants[idx] === 'b') {
      // If the current contestant is of type 'b'
      // Count how many 'b' type contestants appeared before the current one
      for (let innerIdx = 0; innerIdx < idx; innerIdx++) {
        if (contestants[innerIdx] === 'b') {
          foreignCount++;
        }
      }
      // If the current contestant's index (plus one) is less than the count of
      // previous 'b' type contestants, they pass.
      if (idx + 1 < foreignCount) {
        passStatusList[idx] = true;
        continue; // Move to the next contestant
      } else {
        // Otherwise, they fail.
        passStatusList[idx] = false;
      }
      // Reset the foreign contestant counter for the next iteration
      foreignCount = 0;
    } else {
      // For any other contestant type, they automatically fail.
      passStatusList[idx] = false;
      continue; // Move to the next contestant
    }
  }

  // Output the pass/fail status for each contestant
  for (let resultIdx = 0; resultIdx < passStatusList.length; resultIdx++) {
    if (passStatusList[resultIdx]) {
      console.log('Yes\n');
    } else {
      console.log('No\n');
    }
  }
}

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
