'use strict';

// This function serves as the primary entry point for processing the input data.
// It determines if a given string can be transformed into a specific target pattern
// by removing a single, contiguous block of characters.
const processInput = (rawData) => {
  // The first line of the raw input is considered the string to be analyzed.
  const sourceString = rawData.split('\n')[0];

  // The predefined pattern that the source string should match after modification.
  const targetPattern = 'keyence';

  // A boolean-like flag to store the outcome of the analysis.
  // It is initially set to 'YES', assuming a match until proven otherwise.
  let resultFlag = 'YES';

  // An index to track the current position within the `targetPattern`.
  let patternIndex = 0;

  // This variable stores the starting index of any non-matching sequence encountered.
  // A value of -1 indicates that no non-matching sequence has begun yet.
  let gapStartIndex = -1;

  // An index to iterate through the characters of the `sourceString`.
  let sourceIndex = 0;

  // Loop through each character of the source string.
  for (; sourceIndex < sourceString.length; sourceIndex++) {
    // Compare the current character from the source string with the current character
    // from the target pattern.
    if (sourceString[sourceIndex] === targetPattern[patternIndex]) {
      // If they match, advance the target pattern index to the next character.
      patternIndex++;
    } else {
      // If there is a mismatch:
      // Check if a non-matching segment has already been identified (`gapStartIndex !== -1`)
      // AND if the current non-matching character is not directly adjacent to the
      // previously identified non-matching character (`gapStartIndex + 1 !== sourceIndex`).
      // This condition signifies that there are multiple, non-contiguous segments
      // that would need to be removed, which is not allowed by the problem's constraints.
      if (gapStartIndex !== -1 && gapStartIndex + 1 !== sourceIndex) {
        // If this scenario occurs, the string cannot be transformed as required.
        // Set `sourceIndex` to 0 and break the loop. This ensures that the final
        // validation check will correctly identify the failure.
        sourceIndex = 0;
        break;
      }
      // If it's the first non-match, or a continuation of an existing non-match,
      // update `gapStartIndex` to the current `sourceIndex`.
      gapStartIndex = sourceIndex;
    }
  }

  // After the loop completes, perform a final check:
  // 1. Verify if the entire `targetPattern` was successfully matched (`patternIndex !== targetPattern.length`).
  // 2. Verify if the loop completed its full iteration over the `sourceString`,
  //    or if it was prematurely terminated due to an invalid gap (`sourceIndex !== sourceString.length`).
  // If either of these conditions is true, it means the transformation was not successful.
  if (patternIndex !== targetPattern.length || sourceIndex !== sourceString.length) {
    resultFlag = 'NO';
  }

  // Output the final determination to the console.
  console.log(resultFlag);
};

// Read the input from standard input using Node.js's file system module,
// decode it as UTF-8, and then pass it to the `processInput` function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
