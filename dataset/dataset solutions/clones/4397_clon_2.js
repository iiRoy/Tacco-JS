/*
 * This module processes an input string to identify the first lowercase
 * English alphabet character that is not present within the provided text.
 */
function processInputString(incomingText) {
  // Step 1: Normalize and deduplicate the input characters.
  // The input string is first split into an array of individual characters.
  // This array is then sorted alphabetically.
  // Finally, a filter operation is applied to retain only unique characters,
  // ensuring each character appears only once in the resulting collection.
  var distinctSortedChars = incomingText
    .split("")
    .sort()
    .filter(
      (charElement, charIndex, fullCollection) =>
        fullCollection.indexOf(charElement) === charIndex
    );

  // Step 2: Modify the character collection.
  // The very first character (which would be 'a' if present and not removed)
  // is removed from our unique, sorted character list.
  distinctSortedChars.shift();

  // Step 3: Establish a reference set of characters.
  // A constant array is created containing all lowercase letters of the English alphabet.
  const allLowercaseLetters = "abcdefghijklmnopqrstuvwxyz".split("");

  // Step 4: Initialize a variable to store the discovery.
  // This variable will hold the first missing alphabet character once found.
  // It's initialized to an empty string, signifying nothing has been found yet.
  let firstMissingChar = "";

  // Step 5: Search for the earliest missing character.
  // Iterate through each character in our complete lowercase alphabet reference.
  for (const currentAlphabetChar of allLowercaseLetters) {
    // Check if the current alphabet character is NOT present in our
    // processed (distinct, sorted, and first-element-removed) character collection.
    if (distinctSortedChars.indexOf(currentAlphabetChar) === -1) {
      // If the character is not found, it means this is the first one missing.
      firstMissingChar = currentAlphabetChar;
      // As we only need the first missing character, we can terminate the loop early.
      break;
    }
  }

  // Step 6: Output the result.
  // After the search, evaluate whether a missing character was identified.
  if (firstMissingChar === "") {
    // If 'firstMissingChar' remains an empty string, it indicates that
    // all relevant alphabet characters (after the initial shift) were present in the input.
    console.log("None");
  } else {
    // Otherwise, print the specific character that was found to be missing.
    console.log(firstMissingChar);
  }
}

// Invocation: Read input from standard input and execute the primary processing function.
// This line uses Node.js's built-in 'fs' (file system) module to synchronously
// read the entire content of '/dev/stdin' as a UTF-8 encoded string,
// which is then passed as an argument to our processing function.
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));