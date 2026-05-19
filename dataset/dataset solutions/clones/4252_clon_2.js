function processInputData(rawTextContent) {
  // This variable stores the input content after trimming whitespace,
  // then splitting it into an array based on newline characters.
  const lineSegments = rawTextContent.trim().split('\n');

  // This variable holds the trimmed input content, broken down into
  // an array of individual characters.
  const characterSequence = rawTextContent.trim().split('');

  // We compare the string representation of 'lineSegments' (e.g., ['hello'] becomes 'hello')
  // with the reversed and re-joined string of 'characterSequence'.
  if (lineSegments == characterSequence.reverse().join("")) {
    // If the comparison evaluates to true, indicating a specific pattern,
    // we output 'YES' to the console.
    console.log('YES');
  } else {
    // Otherwise, if the pattern does not match, we output 'NO'.
    console.log('NO');
  }
}

// The program initiates by reading the entire content from standard input.
// It uses Node.js's 'fs' module to synchronously read the file at '/dev/stdin',
// interpreting its content as a UTF-8 encoded string.
// This raw string data is then passed to our main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
