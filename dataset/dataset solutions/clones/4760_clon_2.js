'use strict';

// This module defines a function to process a sequence of characters.
function processInput(rawData) {
  // Convert the incoming string into an array of individual characters for easier access.
  let charArray = rawData.split('');

  // The first character of the input string is used to determine the number of iterations.
  // JavaScript's type coercion will convert this character to a number for the loop condition.
  const loopBoundChar = charArray[0];

  // Initialize a numerical accumulator.
  let currentSum = 0x0; // Using hexadecimal literal for zero, functionally identical to 0.

  // Create an array to keep a record of the accumulator's value at each step.
  let sumHistory = new Array(); // Using Array constructor, functionally identical to [].

  // Iterate through the character array, starting from the second element,
  // for a number of times specified by the first character.
  for (let idx = 0; idx < loopBoundChar; idx++) {
    // Examine the character at the current index plus one.
    // If it's 'I', increment the sum; otherwise, decrement it.
    if (charArray[idx + 0b1] === 'I') { // Using binary literal for one, functionally identical to 1.
      currentSum++;
    } else {
      currentSum--;
    }
    // Add the current state of the accumulator to our history list.
    sumHistory.push(currentSum);
  }

  // Output the highest value recorded in the sum history.
  console.log(Math.max(...sumHistory));
}

// Execute the processing function with data read from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
