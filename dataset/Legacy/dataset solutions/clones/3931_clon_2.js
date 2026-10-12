function ProcessInput(inputString) {
  // Determine the length of the input string.
  const stringLength = inputString.length;

  // Get the ASCII code for the character 'a' to use as an offset.
  const charCodeA = "a".charCodeAt(0);

  // Initialize an array to track available characters.
  // Each index corresponds to a letter (0 for 'a', 1 for 'b', etc.).
  // A value of 1 means the character is available, 0 means it's used.
  let availableChars = new Array(26).fill(1);

  // Declare a variable for loop iteration.
  let outerIndex;

  // Check if the string length is less than 26 (meaning it's not a full alphabet permutation).
  if (stringLength < 26) {
    // Mark characters present in the input string as 'used'.
    for (outerIndex = 0; outerIndex < stringLength; outerIndex++) {
      const charOffset = inputString.charCodeAt(outerIndex) - charCodeA;
      availableChars[charOffset] = 0;
    }

    // Find the first available character and append it to the string.
    for (outerIndex = 0; outerIndex < 26; outerIndex++) {
      if (availableChars[outerIndex]) {
        inputString += String.fromCharCode(charCodeA + outerIndex);
        break; // Exit after finding and appending the first available character.
      }
    }
  } else {
    // The string length is 26, implying it's a permutation of the alphabet.
    // Check for the specific case of "zyxwvutsrqponmlkjihgfedcba".
    if (inputString === "zyxwvutsrqponmlkjihgfedcba") {
      console.log(-1); // Output -1 as per problem specification.
      return; // Terminate function execution.
    }

    // Mark the last character of the input string as 'used'.
    availableChars[inputString.charCodeAt(25) - charCodeA] = 0;

    // This is the main processing loop for strings of length 26.
    // It iterates backwards from the second-to-last character.
    mainProcessingLoop: for (outerIndex = 24; outerIndex >= 0; outerIndex--) {
      // Iterate through possible replacement characters starting from the current character's value.
      for (let innerIndex = inputString.charCodeAt(outerIndex) - charCodeA; innerIndex < 26; innerIndex++) {
        // If an available character is found that is lexicographically greater than the current character.
        if (availableChars[innerIndex] === 0) {
          // Truncate the string up to the current character's position.
          inputString = inputString.slice(0, outerIndex);
          // Append the found character.
          inputString += String.fromCharCode(charCodeA + innerIndex);
          break mainProcessingLoop; // Exit both loops once a suitable character is found and appended.
        }
        // If the character at innerIndex is not available, mark the current character as used.
        // This logic seems to be intended to mark characters as 'used' as we consider them for replacement.
        availableChars[inputString.charCodeAt(outerIndex) - charCodeA] = 0;
      }
    }
  }

  // Output the modified string.
  console.log(inputString);
}

// Read input from standard input, decode as UTF-8, and trim whitespace.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
