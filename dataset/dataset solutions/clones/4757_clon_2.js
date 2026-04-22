'use strict'

// Core function to process the provided data stream.
function executeLogic(sourceData) {
  // Convert the input string into a sequence of individual characters.
  let charSequence = sourceData.split('');

  // Determine the numerical extent of processing from the first character.
  // Explicitly convert this character to an integer.
  const processLimit = parseInt(charSequence[0]);

  // Initialize a running total or current balance.
  let currentBalance = 0;

  // Store a historical record of all balance states.
  let balanceHistory = [0];

  // Iterate through the specified range to update the balance.
  for (let cycleIndex = 0; cycleIndex < processLimit; cycleIndex++) {
    // Check the character at an offset position relative to the current index.
    if (charSequence[cycleIndex + 2] === 'I') {
      // If an 'I' is encountered, increase the balance.
      currentBalance++;
    } else {
      // For any other character, decrease the balance.
      currentBalance--;
    }
    // Append the updated balance to the historical record.
    balanceHistory.push(currentBalance);
  }

  // Output the highest balance achieved during the entire process.
  console.log(Math.max(...balanceHistory));
}

// Read the raw content from the standard input and pass it to the processing function.
executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));