/*
 * This utility function determines if a given string is composed entirely of uppercase ASCII letters.
 * It considers an empty string or non-string input as not uppercase.
 *
 * @param {string} textValue - The string to be evaluated for its capitalization status.
 * @returns {boolean} True if the entire string consists of uppercase characters, false otherwise.
 */
const isStringCapitalized = (textValue) => {
  // Validate the input: ensure it is a non-empty string.
  // Non-string inputs or empty strings are immediately classified as not uppercase.
  if (typeof textValue !== 'string' || textValue.length === 0) {
    return false;
  }

  // Define the regular expression pattern to match one or more uppercase English letters.
  // The caret (^) asserts the start of the string, and the dollar sign ($) asserts the end.
  // This ensures the *entire* string matches the pattern, not just a part of it.
  const capitalLetterPattern = /^[A-Z]+$/;

  // Execute the regular expression test and store the outcome.
  const testResult = capitalLetterPattern.test(textValue);

  // Return the boolean result of the test.
  return testResult;
};

/**
 * Main entry point for processing user input to classify the case of its first line.
 * This function takes a raw string, splits it into lines, and then checks if the
 * first line is entirely uppercase. It prints 'A' for uppercase, and 'a' otherwise.
 *
 * @param {string} rawInputContent - The complete input string, which may contain multiple lines
 *                                 separated by newline characters.
 */
function analyzeTextCase(rawInputContent) {
  // Define constants for the expected output messages.
  // This improves readability and makes future changes easier.
  const outputForUpperCase = 'A';
  const outputForLowerCase = 'a'; // This is also the default/fallback output.

  // --- Input Validation and Pre-processing ---

  // Guard clause: Check if the provided input is actually a string.
  // If not, we cannot process it, so we default to the 'lowercase' output.
  if (typeof rawInputContent !== 'string') {
    console.log(outputForLowerCase);
    return; // Exit the function early.
  }

  // Split the incoming raw string into an array of individual lines.
  // The split operation creates an array where each element is a line from the input.
  const processedLines = rawInputContent.split('\n');

  // Guard clause: Check if the split operation resulted in any lines.
  // An empty input string or a string with only newlines might result in an empty array
  // or an array with an empty string as its first element.
  if (processedLines.length === 0) {
    console.log(outputForLowerCase);
    return; // Exit early if no lines are found.
  }

  // --- Core Logic for Case Determination ---

  // Retrieve the very first line from the array for analysis.
  // This is the primary subject of our case check.
  const primarySubjectLine = processedLines[0];

  // Call the helper function to determine if the extracted line is fully capitalized.
  const isPrimaryLineCapitalized = isStringCapitalized(primarySubjectLine);

  // --- Output Generation ---

  // Based on the capitalization status, print the appropriate character to the console.
  if (isPrimaryLineCapitalized) {
    console.log(outputForUpperCase); // The first line is entirely uppercase.
  } else {
    console.log(outputForLowerCase); // The first line is not entirely uppercase (e.g., lowercase, mixed, empty, or contains non-alpha chars).
  }
}