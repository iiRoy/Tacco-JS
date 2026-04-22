// This function is designed to process incoming raw text data,
// specifically to locate and modify a single character within a designated
// string based on an index provided in a separate part of the input.
function processInputData(sourceContent) {

  // Establish constants for string splitting and indexing clarity.
  // These constants enhance readability and maintainability.
  const LINE_DELIMITER = "\n"; // Used to separate input lines.
  const TOKEN_SEPARATOR = " "; // Used to split tokens within a line.
  const DATA_STRING_LINE_IDX = 1; // Array index for the line containing the character sequence.
  const MODIFIER_INDEX_LINE_IDX = 0; // Array index for the line containing the modification point.
  const MODIFIER_VALUE_POS = 1; // Array index within the modifier line for the actual index value.

  // Divide the entire input content into an array of distinct lines.
  // This avoids repeated splitting of the main input string.
  const contentLines = sourceContent.split(LINE_DELIMITER);

  // Extract the specific line that contains the string of characters
  // that will potentially undergo modification.
  let characterSequenceToAlter = contentLines[DATA_STRING_LINE_IDX];

  // Retrieve the raw string representation of the index from the first line.
  // This index dictates which character will be targeted for change.
  const rawModificationIndexString = contentLines[MODIFIER_INDEX_LINE_IDX]
                                     .split(TOKEN_SEPARATOR)[MODIFIER_VALUE_POS];

  // Convert the extracted string index into a numerical value.
  // Explicitly using radix 10 for robust integer parsing.
  const numericalModificationIndex = parseInt(rawModificationIndexString, 10);

  // --- Add a validation fragment: Ensure the provided index is valid. ---
  // This guard clause prevents potential errors from invalid input and provides
  // more robust behavior compared to the original, which assumes valid input.
  if (isNaN(numericalModificationIndex) || numericalModificationIndex < 1) {
    console.error("Error: The modification index is invalid or non-positive. No operation performed.");
    // In case of an invalid index, return the original sequence without modification.
    return characterSequenceToAlter;
  }

  // Adjust the 1-based numerical index to a 0-based index,
  // which is standard for array and string access in JavaScript.
  const zeroBasedTargetIndex = numericalModificationIndex - 1;

  // Another validation fragment: Check if the adjusted index is within the bounds
  // of the target character sequence.
  if (zeroBasedTargetIndex < 0 || zeroBasedTargetIndex >= characterSequenceToAlter.length) {
    console.warn(`Warning: Modification index (${numericalModificationIndex}) is out of bounds for the string length (${characterSequenceToAlter.length}). No character will be modified.`);
    // If the index is out of bounds, return the original sequence.
    return characterSequenceToAlter;
  }

  // Convert the character sequence string into a mutable array of individual characters.
  // This allows for in-place modification of a specific character.
  let characterArrayForModification = characterSequenceToAlter.split("");

  // Access the character at the computed zero-based index directly from the array.
  // This is a subtle rewrite from accessing it from the original string.
  const characterAtTargetPosition = characterArrayForModification[zeroBasedTargetIndex];

  // Transform the identified character to its lowercase equivalent.
  const lowercasedReplacementCharacter = characterAtTargetPosition.toLowerCase();

  // Perform the actual modification: replace the character at the target index
  // in the array with its new, lowercased version.
  characterArrayForModification.splice(zeroBasedTargetIndex, 1, lowercasedReplacementCharacter);

  // Reconstruct the modified character array back into a single string.
  const finalResultingString = characterArrayForModification.join("");

  // Output the transformed string to the standard console.
  console.log(finalResultingString);
}

// The following line serves as the execution entry point for the script.
// It reads all input from the standard input stream (/dev/stdin) as a UTF-8 string,
// and then passes this raw content to our primary processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));