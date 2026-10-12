"use strict";

// This function processes the given input string to calculate
// the distribution of 'R' and 'L' characters based on specific rules.
const processInput = (inputData) => {
  // Normalize the input: remove leading/trailing whitespace and split by newlines.
  inputData = inputData.trim().split("\n");

  // Extract the first line and convert it into an array of characters.
  const charSequence = inputData[0].split("");

  // Initialize counters for 'R' and 'L' characters within a segment.
  let rightCount = 0;
  let leftCount = 0;

  // Variable to store the index of the 'RL' boundary.
  let boundaryIndex;

  // Counter for the number of character type changes ('R' to 'L' or 'L' to 'R').
  let boundaryChanges = 0;

  // Initialize an array to store the final results, filled with zeros.
  let resultArray = [...Array(charSequence.length)].fill(0);

  // Iterate through the character sequence, stopping one character before the end.
  for (let idx = 0; idx < charSequence.length - 1; idx++) {
    // Increment the respective counter based on the current character.
    if (charSequence[idx] === "R") {
      rightCount++;
    }
    if (charSequence[idx] === "L") {
      leftCount++;
    }

    // Check if there's a change in character type (e.g., 'R' followed by 'L').
    // This identifies the 'RL' boundary.
    if (charSequence[idx] !== charSequence[parseInt(idx) + 1]) {
      boundaryChanges++;

      // If this is the first change, record its index.
      if (boundaryChanges === 1) {
        boundaryIndex = idx;
      }
    }

    // When two character type changes are detected, it means an 'RL' segment has ended.
    // The logic here distributes the counts to the 'RL' boundary.
    if (boundaryChanges === 2) {
      // If the total count of 'R' and 'L' is even, distribute equally.
      if ((rightCount + leftCount) % 2 === 0) {
        resultArray[boundaryIndex] = (rightCount + leftCount) / 2;
        resultArray[boundaryIndex + 1] = (rightCount + leftCount) / 2;
      }
      // If the total count is odd, distribute based on ceiling division.
      else {
        resultArray[boundaryIndex] = Math.ceil(leftCount / 2) + 1;
        resultArray[boundaryIndex + 1] = Math.ceil(rightCount / 2) + 1;
      }

      // Reset counters for the next segment.
      boundaryChanges = 0;
      rightCount = 0;
      leftCount = 0;
    }

    // Special handling for the very last character in the sequence.
    // This ensures the final segment is processed.
    if (idx === charSequence.length - 2) {
      leftCount++; // The last character is always 'L' in an 'RL' pattern.

      // Apply the same distribution logic as above for the final segment.
      if ((rightCount + leftCount) % 2 === 0) {
        resultArray[boundaryIndex] = (rightCount + leftCount) / 2;
        resultArray[boundaryIndex + 1] = (rightCount + leftCount) / 2;
      } else {
        resultArray[boundaryIndex] = Math.ceil(leftCount / 2) + 1;
        resultArray[boundaryIndex + 1] = Math.ceil(rightCount / 2) + 1;
      }
    }
  }

  // Output the final result array as a space-separated string.
  console.log(resultArray.join(" "));
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
