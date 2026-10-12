function processInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string.
  const trimmedString = rawData.trim();

  // Initialize an array to store character counts.
  // This array will hold counts for 'a', 'b', 'c' based on their ASCII values.
  let charCounts = trimmedString.split('').reduce((accumulator, currentChar) => {
    // Calculate the index based on the character's ASCII value relative to 'a'.
    // For 'a', index is 0; for 'b', index is 1; for 'c', index is 2.
    accumulator[currentChar.charCodeAt(0) - 'a'.charCodeAt(0)]++;
    return accumulator; // Return the updated accumulator for the next iteration.
  }, [0, 0, 0]); // Start with an array of three zeros.

  // Determine if the difference between the maximum and minimum character counts
  // in the charCounts array is 2 or more.
  if (Math.max(...charCounts) - Math.min(...charCounts) >= 2) {
    // If the difference is 2 or more, print 'NO' to standard output.
    console.log('NO');
  } else {
    // Otherwise (if the difference is less than 2), print 'YES'.
    console.log('YES');
  }
}

// Read input from standard input using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
