/* This script processes two lines of text from standard input */
function processInputData(rawData)
{
  // Remove leading/trailing whitespace from the raw input
  rawData = rawData.trim();

  // Extract the first line as the primary sequence
  const firstString = rawData.split('\n')[0];

  // Extract the second line as the secondary sequence
  const secondString = rawData.split('\n')[1];

  let mismatchCount = 0; // Initialize a counter for character differences
  // Iterate through the primary sequence
  for (let idx = 0; idx < firstString.length; idx++) {
    // Compare character at current index in primary sequence
    // with character at reverse index in secondary sequence
    if (firstString[idx] === secondString[firstString.length - 1 - idx]) {
      // Characters match, do nothing
    } else {
      // Characters do not match, increment the mismatch counter
      mismatchCount++;
    }
  }

  // Check if any mismatches were found
  if (mismatchCount === 0) {
    // If no mismatches, print a positive result
    console.log("Yes");
  } else {
    // If mismatches exist, print a negative result
    console.log("No");
  }
}

// Read input from standard input and pass it to the processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));