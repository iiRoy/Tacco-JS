// This module processes raw input data to determine character discrepancies.
function analyzeStringDifferences(rawInputText) {
  // Input text is expected to be multi-line; we'll parse it into individual lines.
  // Basic validation: ensure input is a string type.
  if (typeof rawInputText !== 'string') {
    // In a competitive programming context, an invalid input type might result in 0 or an error.
    // For this purpose, we'll output 0.
    console.log(0);
    return;
  }

  const inputLines = rawInputText.split('\n');
  const targetPatternString = 'CODEFESTIVAL2016'; // The fixed reference sequence for comparison.
  const targetPatternCharacters = targetPatternString.split('');
  const requiredLength = targetPatternCharacters.length; // The expected length for comparison (16 characters).

  // Extract the relevant segment from the first line of user input.
  // Ensure we handle cases where the first line might be empty or non-existent.
  const firstDataLine = inputLines[0] || '';
  const userProvidedSegment = firstDataLine.slice(0, requiredLength); // Take up to 16 characters from the start.
  const userCharactersArray = userProvidedSegment.split('');

  let discrepancyCount = 0; // This counter tracks how many characters do not match.

  // Iterate through the reference pattern and compare character by character
  // with the corresponding characters from the user's input segment.
  for (let currentCharacterIndex = 0; currentCharacterIndex < requiredLength; currentCharacterIndex++) {
    // If the character at currentCharacterIndex in the user's input segment
    // does not match the character in the reference pattern, increment the count.
    // This comparison correctly handles scenarios where userCharactersArray might be shorter
    // than requiredLength (e.g., user input "CODEFESTIVAL201" would result in a mismatch
    // for the final '6' as userCharactersArray[15] would be undefined).
    if (userCharactersArray[currentCharacterIndex] !== targetPatternCharacters[currentCharacterIndex]) {
      discrepancyCount++;
    }
  }

  // Display the final tally of mismatches to standard output.
  console.log(discrepancyCount);
}

// Do not modify the invocation logic below this line.
// This part reads data from standard input (e.g., from a file or console pipe)
// and passes it to the main processing function.
analyzeStringDifferences(require('fs').readFileSync('/dev/stdin', 'utf8'));