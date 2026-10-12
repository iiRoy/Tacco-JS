function processInput(inputArgs) {
  // This function processes a given string to determine
  // the number of character mismatches between its
  // reversed first half and its second half.

  // The primary string data is expected as the first element
  // of the input arguments array.
  let dataString = inputArgs[0];

  // Variables to hold the two segments of the string after processing.
  let firstHalfReversed;
  let secondHalf;

  // Check if the total length of the string is an even number.
  if (dataString.length % 2 === 0) {
    // If the length is even, split the string exactly in half.
    // The first segment is taken, reversed, and then joined back.
    firstHalfReversed = dataString.substring(0, dataString.length / 2).split("").reverse().join("");
    // The second segment starts from the middle point to the end.
    secondHalf = dataString.substring(dataString.length / 2, dataString.length + 1);
  } else {
    // If the length is odd, the middle character is ignored for comparison.
    // The first segment is taken up to the character before the middle one,
    // then reversed and joined.
    firstHalfReversed = dataString.substring(0, Math.floor(dataString.length / 2)).split("").reverse().join("");
    // The second segment starts from the character after the middle one,
    // extending to the end of the string.
    secondHalf = dataString.substring(Math.floor(dataString.length / 2) + 1, dataString.length + 1);
  }

  // Initialize a counter for character differences.
  let mismatchCount = 0;

  // Iterate through the characters of the two prepared string segments.
  // The loop runs for half the length of the original string,
  // effectively comparing corresponding characters from the "outer" parts.
  for (let idx = 0; idx < Math.floor(dataString.length / 2); idx++) {
    // Compare the character at the current index in both segments.
    if (firstHalfReversed.charAt(idx) !== secondHalf.charAt(idx)) {
      // If the characters do not match, increment the mismatch counter.
      mismatchCount++;
    }
  }

  // Output the final tally of character mismatches to the console.
  console.log(mismatchCount);
}

// The program is executed by reading input from standard input.
// The content read from '/dev/stdin' is treated as a single string,
// which is then wrapped in an array to match the expected 'inputArgs[0]' format.
processInput([require('fs').readFileSync('/dev/stdin', 'utf8')]);
