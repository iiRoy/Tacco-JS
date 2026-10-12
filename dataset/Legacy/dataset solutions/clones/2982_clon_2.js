'use strict';

// This function processes a given input string to compute a specific result.
// It simulates reading data from a standard input source.
function ProcessInput(rawData) {
  // First, we clean up the raw input:
  // - Remove leading/trailing whitespace using .trim().
  // - Split the string into an array of substrings based on any sequence of whitespace characters.
  let processedStrings = rawData.trim().split(/\s+/);

  // The initial numeric value (N) is extracted from the beginning of the array.
  // The `- 0` operation is a concise way to convert the string to a number.
  const countOfElements = processedStrings.shift() - 0; // Original variable N

  // Calculate the total number of strings in the array that conclude with the character 'A'.
  const endsWithA = processedStrings.reduce((accumulator, currentString) => {
    // Check the last character of the current string.
    return accumulator + (currentString[currentString.length - 1] === 'A' ? 1 : 0);
  }, 0);

  // Calculate the total number of strings in the array that commence with the character 'B'.
  const startsWithB = processedStrings.reduce((accumulator, currentString) => {
    // Check the first character of the current string.
    return accumulator + (currentString[0] === 'B' ? 1 : 0);
  }, 0);

  // Calculate the total number of strings that both begin with 'B' and terminate with 'A'.
  const bothEnds = processedStrings.reduce((accumulator, currentString) => {
    // Evaluate both conditions for the current string.
    return accumulator + ((currentString[0] === 'B' && currentString[currentString.length - 1] === 'A') ? 1 : 0);
  }, 0);

  // Count the total occurrences of the substring "AB" across all processed strings.
  const abOccurrences = processedStrings.reduce((accumulator, currentString) => {
    // Splitting by "AB" and subtracting 1 from the length of the resulting array
    // effectively counts the number of "AB" instances.
    return accumulator + currentString.split('AB').length - 1;
  }, 0);

  // Determine the smaller value between the count of strings ending with 'A' and starting with 'B'.
  let minVal = Math.min(endsWithA, startsWithB);

  // Apply a specific adjustment: if all three counts (bothEnds, endsWithA, startsWithB) are identical,
  // then decrement the calculated minimum value.
  if (bothEnds === endsWithA && endsWithA === startsWithB) {
    minVal--;
  }

  // Finally, print the sum of the "AB" occurrences and the adjusted minimum value to the console.
  console.log(abOccurrences + minVal);
}

// Execute the main processing function by reading input from standard input.
// This uses Node.js's file system module to read the content of /dev/stdin synchronously as UTF-8.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
