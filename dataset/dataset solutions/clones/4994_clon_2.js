'use strict';

// Obtain input characters from standard input
const inputChars = require("fs").readFileSync("/dev/stdin", "utf8").split("");

// Initialize the outcome string
let resultString = "Yes";

// Iterate through each character in the input array
for (let idx = 0; idx < inputChars.length; idx++) {
  let charOccurrences = 0; // Counter for current character's frequency

  // Count how many times the character at the current index appears
  inputChars.forEach(currentChar => {
    if (inputChars[idx] === currentChar) {
      charOccurrences++;
    }
  });

  // If the count of the current character is odd, set result to "No" and exit
  if (charOccurrences % 2 === 1) {
    resultString = "No";
    break; // Terminate the loop early
  }
}

// Output the final determination
console.log(resultString);
