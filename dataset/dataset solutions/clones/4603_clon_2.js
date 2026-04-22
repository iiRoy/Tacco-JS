"use strict";

const processInputData = incomingText => {
  // Normalize the input string by trimming and splitting into lines.
  incomingText = incomingText.trim().split("\n");

  // Parse the numerical components from the first line of input.
  const valX = parseInt(incomingText[0].split(" ")[0]);
  const valY = parseInt(incomingText[0].split(" ")[1]);
  const valZ = parseInt(incomingText[0].split(" ")[2]);

  let foundMatch = "NO"; // Initialize a boolean-like flag for the result.

  // Iterate a specific number of times, determined by valY.
  for (let loopIndex = 0; loopIndex < valY; loopIndex++) {
    // Calculate the remainder of (valX * loopIndex) divided by valY.
    let currentRemainder = (valX * loopIndex) % valY;

    // Debugging: check intermediate modulo result
    // console.log( ( valX * loopIndex ) % valY );

    // Check if the calculated remainder matches the target value valZ.
    if (currentRemainder === valZ) {
      foundMatch = "YES"; // Update the flag if a match is found.
      break; // Exit the loop early as the condition is met.
    }
  }

  // Output the final determination.
  console.log(foundMatch);
};

// Read the standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));