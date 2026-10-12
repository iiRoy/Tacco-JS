'use strict';

// This function serves as the primary entry point for handling the program's input.
function processInput(rawData) {
  // First, we convert the raw string input into a numerical target value.
  let targetValue = Number(rawData.trim());

  // A utility function to determine if a given number string contains the digits '7', '5', and '3'.
  const validateDigits = currentNumStr => {
    currentNumStr = String(currentNumStr); // Ensure the input is treated as a string.
    // The bitwise NOT operator (~) is used here to check if indexOf returns -1 (not found).
    // If indexOf returns -1, ~-1 is 0 (falsy). Otherwise, it's a non-zero (truthy) value.
    return ~currentNumStr.indexOf('7') && ~currentNumStr.indexOf('5') && ~currentNumStr.indexOf('3');
  };

  // This recursive function explores numbers formed by concatenating '7', '5', and '3'.
  const exploreNumbers = currentSequence => {
    // The base condition for recursion: if the sequence is empty or its numerical value
    // has exceeded the specified target, we either proceed or terminate this branch.
    if (currentSequence === '' || Number(currentSequence) <= targetValue) {
      // Initialize a counter. If the current sequence meets the digit criteria, add 1.
      let resultCount = validateDigits(currentSequence) ? 1 : 0;

      // Recursively call this function, appending '7', '5', and '3' to the current sequence.
      // The results from these branches are accumulated.
      resultCount += exploreNumbers(Number(currentSequence + '7'));
      resultCount += exploreNumbers(Number(currentSequence + '5'));
      resultCount += exploreNumbers(Number(currentSequence + '3'));

      return resultCount; // Return the total count for this branch.
    } else {
      // If the current sequence's numerical value is greater than the target,
      // this branch does not contribute to the count.
      return 0;
    }
  };

  // Initiate the number exploration process starting with an empty string,
  // and then output the final tally to the console.
  console.log(exploreNumbers(''));
}

// Read the entire content of standard input, decode it as UTF-8,
// and then pass it to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
