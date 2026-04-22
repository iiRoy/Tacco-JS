const processData = (dataSource) => {
  // This function analyzes a string to count character mismatches
  // for a palindrome-like comparison.

  let targetString = dataSource[0]; // Obtain the primary data string from the input array.
  let stringLength = targetString.length; // Determine the total count of characters in the string.

  let mismatchCount = 0; // Initialize a variable to store the number of differing character pairs.

  // Iterate through the first half of the string.
  // We use Math.floor to ensure correct indexing for both even and odd length strings.
  for (let counter = 0; counter < Math.floor(stringLength / 2); counter++) {
    const charFront = targetString[counter]; // Retrieve the character from the beginning of the string.
    const charBack = targetString[stringLength - 1 - counter]; // Retrieve the character from the end, moving inwards.

    // Compare the two characters.
    if (charFront !== charBack) {
      mismatchCount++; // If they are not identical, increment the mismatch counter.
    }
  }

  // Display the final tally of mismatches.
  console.info(mismatchCount);
};

// Invoke the data processing function.
// It reads input from standard input, decodes it, removes leading/trailing whitespace,
// and splits it into an array by newlines, then passes it to the function.
processData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }).trim().split('\n'));