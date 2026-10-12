'use strict';

// This script reads characters from standard input and checks a specific condition.

const inputChars = require("fs").readFileSync("/dev/stdin", "utf8").split("");
let resultString = "Yes"; // Initialize the outcome as "Yes"

// Iterate through each character in the input array
for (let idx = 0; idx < inputChars.length; idx++) {
  let charOccurrences = 0; // Counter for the current character's frequency

  // Count the total occurrences of the character at the current index (inputChars[idx])
  inputChars.forEach(currentChar => {
    if (inputChars[idx] === currentChar) {
      charOccurrences++; // Increment the counter if a match is found
    }
  });

  // If the count of the current character is an odd number, the condition is not met
  if (charOccurrences % 2 === 1) {
    resultString = "No"; // Change the outcome to "No"
    break; // Exit the loop immediately, no need to check further characters
  }
}

// Print the final determined result to the console
console.log(resultString);
