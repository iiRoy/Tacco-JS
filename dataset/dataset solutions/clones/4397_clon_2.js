function ProcessInput(sourceText) {
  // This section processes the input string:
  // 1. Splits it into an array of individual characters.
  // 2. Sorts these characters alphabetically.
  // 3. Filters the sorted array to retain only unique characters.
  //    The filter condition `fullArray.indexOf(charItem) === idx` ensures that
  //    only the first occurrence of each character is kept.
  // 4. The `shift()` method then removes the very first character from this
  //    newly formed array of unique, sorted characters.
  var uniqueChars = sourceText.split('').sort().filter((charItem, idx, fullArray) => fullArray.indexOf(charItem) === idx);
  uniqueChars.shift();

  // Defines an array containing all lowercase letters of the English alphabet.
  var allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // Initializes a variable to hold the first missing character found.
  // It starts as an empty string, indicating no missing character has been identified yet.
  var missingChar = '';

  // Iterates through each character in the complete alphabet.
  for (var currentLetter of allLetters) {
    // Checks if the current alphabet letter is NOT present in the `uniqueChars` array.
    if (uniqueChars.indexOf(currentLetter) === -1) {
      // If the character is not found, it means this is the first missing character.
      // Assign it to `missingChar` and exit the loop immediately.
      missingChar = currentLetter;
      break;
    }
  }

  // Based on whether a missing character was found, print the appropriate output.
  if (missingChar === '') {
    // If `missingChar` is still an empty string, it implies all alphabet letters
    // (up to the point of iteration) were present in the processed input.
    console.log('None');
  } else {
    // Otherwise, print the first lowercase alphabet character that was missing.
    console.log(missingChar);
  }
}

// Reads the entire content from standard input (`/dev/stdin`) as a UTF-8 encoded string.
// This content is then passed as an argument to the `ProcessInput` function for analysis.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
