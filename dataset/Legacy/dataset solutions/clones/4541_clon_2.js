"use strict";

// This function processes the given input string to determine if it contains duplicate adjacent characters after sorting.
const ProcessInputData = (rawText) => {
  // Trim whitespace, split into individual characters, and then sort them alphabetically.
  let sortedCharacterList = rawText.trim().split('').sort();

  // Initialize a variable to store the final outcome.
  let finalVerdict = '';

  // Iterate through the sorted list of characters.
  for (let charIndex = 0; charIndex < sortedCharacterList.length; charIndex++) {
    // Check if the current character is identical to the next character in the sequence.
    if (sortedCharacterList[charIndex] === sortedCharacterList[charIndex + 1]) {
      // If a duplicate is found, set the verdict to "no" and exit the loop immediately.
      finalVerdict = "no";
      break;
    } else {
      // If no duplicate is found so far, set the verdict to "yes".
      // This will be overwritten if a duplicate is found later.
      finalVerdict = "yes";
    }
  }

  // Output the determined verdict to the console.
  console.log(finalVerdict);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
