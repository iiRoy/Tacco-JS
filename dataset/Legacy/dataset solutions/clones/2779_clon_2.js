function processInputData(rawInputString) {
  // Extract the first four individual characters from the provided input string.
  // Each character is obtained using the substr method with a length of 1.
  let firstExtractedChar = rawInputString.substr(0, 1);
  let secondExtractedChar = rawInputString.substr(1, 1);
  let thirdExtractedChar = rawInputString.substr(2, 1);
  let fourthExtractedChar = rawInputString.substr(3, 1);

  // A temporary variable is assigned the original input string.
  // This variable is immediately superseded by an array assignment later.
  let temporaryStringReference = rawInputString;

  // Create an array containing the four extracted characters.
  let characterSequence = [
    firstExtractedChar,
    secondExtractedChar,
    thirdExtractedChar,
    fourthExtractedChar,
  ];

  // Sort the array of characters in ascending alphabetical order.
  characterSequence.sort();

  // Reassign new variables to hold the characters from the sorted array.
  // These now represent the characters in sorted order.
  let smallestCharacter = characterSequence[0];
  let secondSmallestCharacter = characterSequence[1];
  let thirdSmallestCharacter = characterSequence[2];
  let largestCharacter = characterSequence[3];

  // Initialize a numerical flag to indicate whether a specific pattern is found.
  let matchFlag = 0; // Corrected from full-width semicolon to standard semicolon.

  // Evaluate a specific condition: if the sorted characters form an 'AABB' pattern.
  // This means the first two characters are identical, and the last two are identical,
  // but the first pair is different from the second pair.
  if (smallestCharacter === secondSmallestCharacter) {
    // If the first character is equal to the second character.
    if (smallestCharacter !== thirdSmallestCharacter) {
      // And the first character is not equal to the third character.
      // The original code had a syntax error here: `( c == d){var f 1;}`.
      // This has been corrected to a valid nested if statement, preserving the intended logic.
      if (thirdSmallestCharacter === largestCharacter) {
        // And the third character is equal to the fourth character.
        matchFlag = 1; // Set the flag to 1, indicating the pattern was matched.
      }
    }
  }

  // Output 'Yes' if the pattern flag is set, otherwise output 'NO'.
  if (matchFlag === 1) {
    console.log("Yes");
  } else {
    console.log("NO");
  }
}

// Read the entire content of standard input as a UTF-8 encoded string.
// The original code had a typo 'ut8', which has been corrected to 'utf8' for proper encoding.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
