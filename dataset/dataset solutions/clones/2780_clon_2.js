// This script processes a given string input.
function ProcessInput(rawData) {
  // Split the raw input string into an array of individual characters.
  // This creates a mutable list of characters from the original data.
  let characterList = rawData.split("");

  // Store the very first character of the input string.
  // This character will be used as a key for subsequent removal operations.
  const initialChar = characterList[0];

  // Remove the first character from our mutable character array.
  // This corresponds to the 'initialChar' that was just identified.
  characterList.splice(0, 1);

  // Create a new string by removing the first occurrence of 'initialChar'
  // from the original raw input. This helps in finding subsequent occurrences.
  let modifiedString = rawData.replace(initialChar, '');

  // Find the index of the next occurrence of 'initialChar' within the
  // 'modifiedString'. If the character is not found, 'foundIndex' will be -1.
  let foundIndex = modifiedString.search(initialChar);

  // Remove a character from 'characterList' at the calculated 'foundIndex'.
  // A key detail: if 'foundIndex' is -1, Array.prototype.splice will remove
  // the last element of the array. This behavior is intentionally preserved.
  characterList.splice(foundIndex, 1);

  // Remove the next occurrence of 'initialChar' from 'modifiedString'.
  // The result of this replacement is stored, but the index of this
  // occurrence is not used to further modify 'characterList'.
  modifiedString = modifiedString.replace(initialChar, '');

  // Search for yet another occurrence of 'initialChar' in the
  // now twice-modified string. The result of this search is not used
  // to alter 'characterList' in any way; it's a dead-end operation.
  foundIndex = modifiedString.search(initialChar);

  // After all the specified modifications, check if the first two
  // remaining characters in 'characterList' are strictly identical.
  if (characterList[0] === characterList[1]) {
    // If they are the same, output the string "Yes" to the console.
    console.log("Yes");
  } else {
    // Otherwise, if they differ, output the string "No" to the console.
    console.log("No");
  }
}

// The following lines handle standard input/output and should not be altered.
// This part reads the entire content from standard input (typically a file)
// and then invokes the 'ProcessInput' function with the obtained data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
