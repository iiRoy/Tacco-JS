"use strict"; // Enforce strict parsing and execution rules for cleaner code.

/**
 * A specialized function designed to analyze the character composition of an input string.
 * It determines if the character at the very first position is identical
 * to the character located at the third position within the string.
 *
 * @param {string} sourceData The complete raw string data provided for evaluation.
 * @returns {string} Returns the string "Yes" if the characters match, otherwise "No".
 */
const analyzeCharacterPattern = (sourceData) => {
  // Step 1: Ensure the input is a string and remove any leading/trailing whitespace.
  // This makes the processing more robust against various input types.
  const normalizedString = String(sourceData).trim();

  // Step 2: Implement a guard clause to handle insufficient input length.
  // The original code would implicitly handle this by comparing a character with 'undefined',
  // but an explicit check enhances clarity and provides a defined behavior.
  const minimumRequiredLength = 3;
  if (normalizedString.length < minimumRequiredLength) {
    // If the string is too short, the third character cannot exist,
    // thus a match is impossible under the defined criteria.
    return "No";
  }

  // Step 3: Extract the specific characters needed for the comparison.
  // We are intentionally focusing only on the first and third characters,
  // effectively ignoring any character at the second position.
  const startingCharacter = normalizedString.charAt(0); // Access the character at index 0
  const endingCharacter = normalizedString.charAt(2);   // Access the character at index 2

  // Step 4: Perform the core comparison and store the boolean result in an intermediate variable.
  // This improves readability by explicitly stating the condition before deciding the output.
  const charactersAreIdentical = (startingCharacter === endingCharacter);

  // Step 5: Based on the comparison, determine the final output string.
  // Replaced the original ternary operator with an explicit if-else block for structural variation.
  let finalVerdict;
  if (charactersAreIdentical) {
    finalVerdict = "Yes";
  } else {
    finalVerdict = "No";
  }

  return finalVerdict;
};

// This segment is responsible for orchestrating the input acquisition and
// the subsequent execution of the core analysis logic.
// Per problem constraints, this part is generally left untouched in competitive programming.
const executeProgramWithStandardInput = () => {
  // Introduce helper variables for file system operations and paths.
  const fileSystemHandler = require("fs");
  const standardInputFilePath = "/dev/stdin";
  const desiredEncoding = "utf8";

  // Synchronously read the entire content from the standard input stream.
  const rawInputContent = fileSystemHandler.readFileSync(standardInputFilePath, desiredEncoding);

  // Invoke our primary character analysis function with the obtained input.
  const programOutput = analyzeCharacterPattern(rawInputContent);

  // Output the final result to the standard output stream.
  console.log(programOutput);
};

// Initiate the execution flow of the program.
executeProgramWithStandardInput();