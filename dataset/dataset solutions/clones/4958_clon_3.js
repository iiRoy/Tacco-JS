// Function responsible for parsing the input data and performing character transformations.
function processInputData(rawInputTextContent) {
  // Define constants for ASCII character codes and alphabet size to improve readability and maintainability.
  const ASCII_CODE_FOR_LOWER_A = 'a'.charCodeAt(0); // Numeric ASCII value for the character 'a'.
  const ASCII_CODE_FOR_LOWER_Z = 'z'.charCodeAt(0); // Numeric ASCII value for the character 'z'.
  const ALPHABET_TOTAL_SIZE = 26;                 // The total number of letters in the English alphabet.

  // Divide the complete raw text input into an array of individual lines.
  // Using a regex with `\r?\n` ensures compatibility with both Unix (`\n`) and Windows (`\r\n`) line endings.
  const arrayOfInputLines = rawInputTextContent.split(/\r?\n/);

  // Implement a guard clause to handle insufficient input lines.
  // The algorithm expects at least two lines: one for the string and one for the shift value.
  if (arrayOfInputLines.length < 2) {
    // If input is malformed, return the first line if it exists, otherwise an empty string.
    // This deviates slightly from original which would error, but ensures graceful handling for a clone.
    return arrayOfInputLines[0] || '';
  }

  // Extract the primary string for modification from the first line of input.
  let mutableTargetString = arrayOfInputLines[0];
  // Parse the numeric shift value from the second line of input.
  // Using `Number.parseInt` with radix 10 for explicit base conversion.
  let initialNumericShiftValue = Number.parseInt(arrayOfInputLines[1], 10);

  // Another guard clause: validate the parsed shift value.
  // Ensure it is a valid non-negative number. If not, normalize it to zero.
  if (Number.isNaN(initialNumericShiftValue) || initialNumericShiftValue < 0) {
    initialNumericShiftValue = 0; // Default to no shift if input is invalid or negative.
  }

  // If the target string itself is empty, there's no processing needed.
  if (mutableTargetString.length === 0) {
    return '';
  }

  // Convert the target string into an array of characters.
  // This allows for efficient in-place modification of individual characters,
  // as JavaScript strings are immutable.
  const characterModificationBuffer = Array.from(mutableTargetString);
  let remainingShiftBudget = initialNumericShiftValue; // This budget will decrease as shifts are applied.

  // Iterate through each character of the string, from the beginning up to and including the last character.
  for (let currentCharacterIndex = 0; currentCharacterIndex < characterModificationBuffer.length; currentCharacterIndex++) {
    // Determine if the current character is the final character in the string.
    const isTheLastCharacterInSequence = (currentCharacterIndex === characterModificationBuffer.length - 1);

    // Get the ASCII numerical representation of the character at the current position.
    let currentCharacterAsciiCode = characterModificationBuffer[currentCharacterIndex].charCodeAt(0);

    // Logic for the last character:
    // Any remaining shift budget is applied directly to the last character, with wrapping.
    if (isTheLastCharacterInSequence) {
      // Calculate the effective shift amount, ensuring it wraps within the alphabet range (0-25).
      const effectiveShiftForFinalChar = remainingShiftBudget % ALPHABET_TOTAL_SIZE;
      let newCalculatedAsciiCode = currentCharacterAsciiCode + effectiveShiftForFinalChar;

      // Handle character wrapping around from 'z' back to 'a' if the shift exceeds 'z'.
      if (newCalculatedAsciiCode > ASCII_CODE_FOR_LOWER_Z) {
        newCalculatedAsciiCode -= ALPHABET_TOTAL_SIZE; // Subtract 26 to bring it back into the 'a'-'z' range.
      }
      // Update the character in the buffer with the new, shifted character.
      characterModificationBuffer[currentCharacterIndex] = String.fromCharCode(newCalculatedAsciiCode);
    } else {
      // Logic for all characters *except* the last one:
      // Attempt to convert the character to 'a' if possible given the shift budget.

      // Calculate the 'cost' (number of shifts) required to transform the current character to 'a'.
      // If the character is already 'a', the cost is zero. Otherwise, it's the distance to 'a' wrapping around.
      const shiftCostToBecomeA = (currentCharacterAsciiCode === ASCII_CODE_FOR_LOWER_A)
                               ? 0
                               : (ALPHABET_TOTAL_SIZE - (currentCharacterAsciiCode - ASCII_CODE_FOR_LOWER_A));

      // Check if we have enough budget to perform this transformation AND if the character isn't already 'a'.
      if (remainingShiftBudget >= shiftCostToBecomeA && shiftCostToBecomeA > 0) {
        remainingShiftBudget -= shiftCostToBecomeA; // Deduct the cost from the available budget.
        characterModificationBuffer[currentCharacterIndex] = 'a'; // Set the character to 'a'.
      }
    }
  }

  // After iterating through all characters, join the modified character array back into a single string.
  return characterModificationBuffer.join('');
}

// Main execution block of the script.
// This section handles reading input from a file, calling the processing function,
// and outputting the final result to the console.
const fileSystemUtility = require("fs"); // Import the Node.js file system module.
const standardInputFilePath = "/dev/stdin"; // Define the standard input file path for typical competitive programming environments.
const requestedEncodingType = "utf8";       // Specify the character encoding for file reading.

let retrievedInputContent;
// Use a try-catch block to gracefully handle potential errors during file reading.
try {
  retrievedInputContent = fileSystemUtility.readFileSync(standardInputFilePath, requestedEncodingType);
} catch (fileAccessError) {
  // If an error occurs (e.g., file not found, permission issues), log the error.
  console.error("An error occurred while attempting to read the input file:", fileAccessError.message);
  // Provide a safe fallback (empty string) to prevent the program from crashing.
  retrievedInputContent = "";
}

// Call the primary function to process the input data.
const finalTransformedString = processInputData(retrievedInputContent);

// Output the resulting transformed string to the standard output.
console.log(finalTransformedString);