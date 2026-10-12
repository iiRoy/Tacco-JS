function processInput(rawData) {
  // Divide the incoming data into separate lines based on the newline character.
  const lines = rawData.split('\n');

  // Obtain the first segment from the parsed lines, which serves as the primary source.
  const sourceString = lines[0];

  // Retrieve the second segment, intended for comparison against the processed source.
  const destinationString = lines[1];

  // Execute the core transformation and comparison logic:
  // 1. Convert the source value to a string explicitly.
  // 2. Break the string into an array of individual characters.
  // 3. Invert the order of elements within the character array.
  // 4. Recombine the characters into a new string.
  // 5. Compare this newly formed string with the destination string (also explicitly converted).
  // 6. Assign 'YES' if the strings are identical, otherwise assign 'NO'.
  const comparisonOutcome = String(sourceString).split('').reverse().join('') === String(destinationString) ? 'YES' : 'NO';

  // Display the final outcome of the comparison to the console.
  console.log(comparisonOutcome);
}

// Initiate the data processing by reading content from the standard input stream.
// The 'fs' module is utilized for synchronous file reading, specifying UTF-8 encoding.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
