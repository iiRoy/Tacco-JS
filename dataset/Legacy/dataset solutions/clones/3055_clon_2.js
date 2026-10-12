const processInput = (rawData) => {
  // The input string is trimmed and then split into an array of individual characters.
  var charArray = rawData.trim().split("");

  // Initialize two counters for tracking required changes for two alternating patterns.
  // 'countA' corresponds to a target pattern like 010101...
  // 'countB' corresponds to a target pattern like 101010...
  var countA = 0, countB = 0;

  // Loop through each character in the array to determine necessary flips.
  for (var idx = 0; idx < charArray.length; idx++) {
    // Convert the character at the current index to a numeric digit.
    var currentDigit = charArray[idx] - 0;

    // Check if the current index is an even position (0, 2, 4, ...)
    if (idx % 2 === 0) {
      // For even positions:
      // If the digit is '1', it needs to be changed for the 010101... pattern.
      if (currentDigit === 1) {
        countA++;
      }
      // If the digit is '0', it needs to be changed for the 101010... pattern.
      else {
        countB++;
      }
    }
    // If the current index is an odd position (1, 3, 5, ...)
    else {
      // For odd positions:
      // If the digit is '0', it needs to be changed for the 010101... pattern.
      if (currentDigit === 0) {
        countA++;
      }
      // If the digit is '1', it needs to be changed for the 101010... pattern.
      else {
        countB++;
      }
    }
  }

  // Print the minimum number of changes required between the two patterns.
  console.log(Math.min(countA, countB));
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
