function ProcessInput(rawData) {
  // The raw input string is first split by newline characters.
  // We then take the very first line of input for processing.
  rawData = rawData.split('\n');
  // This line converts the selected input string into an array of individual characters.
  const charArray = rawData[0].split('');

  // A boolean flag to indicate if any modifications were made during an iteration.
  let hasModifications = true;
  // An integer variable to keep track of the starting position for the inner loop.
  let startIndex = 0;
  // A counter to tally the number of successful character transformations.
  let operationCount = 0;

  // The main processing loop continues as long as the 'hasModifications' flag is true.
  while (hasModifications) {
    // Reset the modification flag at the beginning of each outer loop iteration.
    hasModifications = false;

    // This inner loop iterates through the character array, starting from 'startIndex'.
    for (let idx = startIndex; idx < charArray.length; idx++) {
      // We check for a specific sequence of three characters: 'A', 'B', and 'C'.
      if (charArray[idx] === 'A' && charArray[idx + 1] === 'B' && charArray[idx + 2] === 'C') {
        // If the 'ABC' sequence is found, we call a helper function to rearrange them.
        rearrangeChars(charArray, idx);
        // Increment the total count of operations performed.
        operationCount = operationCount + 1;
        // Set the flag to true, indicating that a change has occurred in this pass.
        hasModifications = true;
      }
    }
    // After each full pass of the inner loop, we advance the 'startIndex'.
    // This optimization helps to avoid re-checking characters that have already been processed.
    startIndex = startIndex + 2;
  }
  // Finally, the total number of transformations is printed to the console.
  console.log(operationCount);
}

// This auxiliary function takes a character sequence and a starting position.
// It performs a specific rearrangement: 'ABC' becomes 'BCA' at the given position.
function rearrangeChars(charSequence, initialPos) {
  charSequence[initialPos] = 'B';
  charSequence[initialPos + 1] = 'C';
  charSequence[initialPos + 2] = 'A';
}

// The program execution begins by reading input from standard input.
// The 'fs' module is used to synchronously read the file content from '/dev/stdin' as UTF-8.
// This content is then passed to the 'ProcessInput' function for execution.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
