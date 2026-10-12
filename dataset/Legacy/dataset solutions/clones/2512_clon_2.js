function ProcessInput(rawData) {
  // Split the incoming raw data string into an array of lines, using the newline character as a delimiter.
  let linesOfData = rawData.split('\n');

  // Extract the first line, which represents the sequence of characters, and split it into an array of individual characters.
  const characterSequence = linesOfData[0].split('');

  // The second line contains a numerical value that acts as a multiplier.
  // It's stored as a string initially, similar to the original code's implicit type handling.
  const repetitionFactor = linesOfData[1];

  // Initialize a variable to keep track of the number of adjacent identical characters found.
  let adjacentMatchCount = 0;

  // Iterate through the character sequence from the first element up to the second-to-last element.
  // This ensures that `characterSequence[currentIdx + 1]` is always a valid index within the loop.
  for (let currentIdx = 0; currentIdx < characterSequence.length; currentIdx++) {
    // Compare the character at the current index with the character immediately following it.
    if (characterSequence[currentIdx] === characterSequence[currentIdx + 1]) {
      // If the characters are identical, increment the counter for adjacent matches.
      adjacentMatchCount++;
    }
  }

  // Multiply the total count of adjacent matches by the repetition factor.
  // JavaScript will implicitly convert 'repetitionFactor' to a number for this operation.
  adjacentMatchCount *= repetitionFactor;

  // Perform a special check: compare the very first character with the character at the array's length index.
  // In JavaScript, `characterSequence[characterSequence.length]` will evaluate to `undefined` for non-empty arrays.
  // This condition will only be true if `characterSequence[0]` is also `undefined` (i.e., the array is empty).
  if (characterSequence[0] === characterSequence[characterSequence.length]) {
    // If this specific condition is met, add (repetitionFactor - 1) to the total count.
    // Again, 'repetitionFactor' undergoes implicit type conversion here.
    adjacentMatchCount += repetitionFactor - 1;
  }

  // Output the final calculated count to the standard console.
  console.log(adjacentMatchCount);
}

// Read the entire content of the standard input stream as a UTF-8 encoded string.
// Then, invoke the main processing function with the obtained input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
