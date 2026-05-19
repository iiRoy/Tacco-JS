const processInput = rawData => {
  // This function takes raw text input, processes it, and returns a numerical result.
  // It first cleans the input by trimming whitespace and splitting it into lines.
  // Each line is then mapped to an array of its individual characters.
  // The resulting two character arrays are destructured into distinct variables.
  const [firstSequence, secondSequence] = rawData.trim().split("\n").map(elementItem => [...elementItem]);

  // Obtain the length of the first character sequence.
  // It is assumed that both sequences will have the same length.
  const sequenceLength = firstSequence.length;

  // Initialize a counter to keep track of the differences found between the sequences.
  let mismatchCount = 0;

  // Iterate through the character arrays from the initial position up to their full length.
  for (let idx = 0; idx < sequenceLength; idx++) {
    // Compare the characters at the current index in both sequences.
    // If they are not identical, increment the difference counter.
    if (firstSequence[idx] !== secondSequence[idx]) {
      mismatchCount++;
    }
  }

  // After checking all characters, return the total number of mismatches.
  return mismatchCount;
};

// The program reads its input from the standard input stream,
// decodes it using UTF-8, and then passes this data to the 'processInput' function.
// The final computed result is then printed to the standard output.
console.log(processInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
