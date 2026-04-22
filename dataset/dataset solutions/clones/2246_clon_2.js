const processInput = (sourceData) => {
  // Identify and isolate the primary character from the incoming data stream.
  let targetChar = sourceData.trim();

  /*
   * Establish the canonical order of lowercase English characters.
   * This constant array serves as our lookup dictionary.
   */
  const letterSequence = [
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x',
    'y', 'z'
  ];

  // Discover the positional index of the identified character within the sequence.
  let foundIndex = letterSequence.indexOf(targetChar);

  // Display the character immediately succeeding the located character in the sequence.
  console.log(letterSequence[foundIndex + 1]);
};

// Initiate the character processing routine by reading content from the standard input path.
// The 'fs' module is employed to perform synchronous file read operations.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));