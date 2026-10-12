'use strict'; // Enforce strict parsing and error handling

// Read all characters from standard input, treating each as a separate element.
const inputChars = require("fs").readFileSync("/dev/stdin", "utf8").split("");

// Initialize a variable to store the ultimate decision.
let finalVerdict = "Yes";

// Iterate through each character in the input array using a traditional loop.
for (let idx = 0; idx < inputChars.length; idx++) {
  // Initialize a counter for the current character's occurrences.
  let occurrenceTally = 0;

  // For each character in the input, check its frequency.
  inputChars.forEach(currentChar => {
    // If the character at the current index matches the iterated character, increment the tally.
    if (inputChars[idx] == currentChar) {
      occurrenceTally++;
    }
  });

  // If the total count of the current character is not an even number,
  // then the condition is not met.
  if (occurrenceTally % 2 !== 0) {
    finalVerdict = "No"; // Set the verdict to "No".
    break; // Exit the loop early as the condition is already violated.
  }
}

// Output the determined verdict to the console.
console.log(finalVerdict);
