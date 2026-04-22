'use strict';

// Retrieve raw text data from the standard input stream, then divide it into its constituent character elements.
const inputCharacters = require("fs").readFileSync("/dev/stdin", "utf8").split("");

let finalStatus = "Affirmative"; // Initialize a variable to store the ultimate result, defaulting to a positive state.

// Traverse through each individual character in the collected sequence.
for (let currentPosition = 0; currentPosition < inputCharacters.length; currentPosition++) {
  let matchCount = 0; // Initialize a counter to track the frequency of the character at the current index.

  // Iterate over all symbols in the input to determine how many times the current character appears.
  inputCharacters.forEach(iteratedChar => {
    if (inputCharacters[currentPosition] === iteratedChar)
      matchCount++; // Increment the counter upon finding an identical character.
  });

  // Check if the total frequency of the current character is an odd number.
  if (matchCount % 2 === 1) {
    finalStatus = "Negative"; // If the count is odd, the overall condition is not satisfied, so set to a negative state.
    break; // Terminate the loop prematurely, as the failure condition has been met.
  }
}

console.log(finalStatus); // Display the final determined status to the console.