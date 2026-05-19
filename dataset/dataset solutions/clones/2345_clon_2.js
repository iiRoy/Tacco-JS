function processInput(dataLines) {
  // Extract the first line of input, which is the string to analyze.
  let firstLineString = dataLines[0];

  // Determine the total character count of the string.
  const stringLength = firstLineString.length;

  // Initialize a counter for character mismatches.
  let mismatchCount = 0;

  // Iterate through the first half of the string to compare characters.
  // We use Math.trunc to handle odd-length strings correctly,
  // as the middle character doesn't need comparison.
  for (let idx = 0; idx < Math.trunc(stringLength / 2); idx++) {
    // Get the character from the front of the string.
    const charFront = firstLineString[idx];
    // Get the corresponding character from the back of the string.
    const charBack = firstLineString[stringLength - 1 - idx];

    // If the characters do not match, increment the mismatch counter.
    if (charFront !== charBack) {
      mismatchCount++;
    }
  }

  // Output the final count of mismatches to the console.
  console.log(mismatchCount);
}

// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
// and split into an array of lines. Then, pass this array to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
