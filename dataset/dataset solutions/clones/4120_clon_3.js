/**
 * @fileoverview
 * This script processes input data to validate if a given string conforms
 * to a specific numerical hyphenated format.
 * The format is defined by two integer lengths, X and Y, where the string
 * should consist of X digits, followed by a hyphen, then Y digits.
 *
 * This is a Type III clone, featuring extensive renaming, reformatting,
 * structural alterations, and the inclusion of additional validation logic
 * compared to the original source.
 */

// Define the primary handler for the incoming data stream.
const analyzeInputFormat = (dataSourcePayload) => {
  // Begin by cleaning and segmenting the raw input.
  // Ensure any extraneous whitespace is removed from the payload.
  const fullInputContent = dataSourcePayload.trim();

  // Divide the content into individual lines.
  const lineSegments = fullInputContent.split('\n');

  // --- Input Validation: Ensure sufficient data lines are present ---
  if (lineSegments.length < 2) {
    // If fewer than two lines are provided, the format cannot be determined or checked.
    console.log('No');
    return;
  }

  // Extract the format specification line and the string to be validated.
  const formatSpecifiersLine = lineSegments[0];
  const stringToEvaluate = lineSegments[1];

  // --- Input Validation: Check for empty lines after splitting ---
  if (!formatSpecifiersLine || !stringToEvaluate) {
    // If either essential line is empty, it's an invalid input scenario.
    console.log('No');
    return;
  }

  // Parse the format specification line to get the two length parameters.
  const specifierParts = formatSpecifiersLine.split(' ');

  // --- Input Validation: Ensure two format specifiers are provided ---
  if (specifierParts.length < 2) {
    // If not exactly two parts (e.g., "A B"), the format is incomplete.
    console.log('No');
    return;
  }

  // Retrieve the raw string representations of the counts.
  const firstCountRaw = specifierParts[0];
  const secondCountRaw = specifierParts[1];

  // Convert the string counts to integers for numerical processing.
  // Use parseInt with radix 10 for explicit base conversion.
  const expectedFirstCount = parseInt(firstCountRaw, 10);
  const expectedSecondCount = parseInt(secondCountRaw, 10);

  // --- Input Validation: Verify parsed counts are valid positive integers ---
  if (isNaN(expectedFirstCount) || isNaN(expectedSecondCount) || expectedFirstCount <= 0 || expectedSecondCount <= 0) {
    // If counts are not valid numbers or are non-positive, the format is invalid.
    console.log('No');
    return;
  }

  // --- Dynamic Regular Expression Construction ---
  // Define constants for regex components to improve readability and maintainability.
  const digitPlaceholder = '\\d'; // Represents any digit [0-9]
  const separatorCharacter = '-'; // The literal hyphen character

  // Build the regular expression string in a piecewise manner.
  let regexStringBuilder = '^'; // Anchor to the beginning of the string
  regexStringBuilder += digitPlaceholder + '{' + expectedFirstCount + '}'; // First sequence of digits
  regexStringBuilder += separatorCharacter; // The mandatory separator
  regexStringBuilder += digitPlaceholder + '{' + expectedSecondCount + '}'; // Second sequence of digits
  regexStringBuilder += '$'; // Anchor to the end of the string

  // Create the final regular expression object.
  // No 'g' flag is needed as we only care about a single full match.
  const formatValidationExpression = new RegExp(regexStringBuilder);

  // --- String Evaluation ---
  // Use the test() method of the RegExp object, which returns a boolean directly.
  const isFormatCorrect = formatValidationExpression.test(stringToEvaluate);

  // --- Output Result ---
  // Based on the validation outcome, print the appropriate message.
  if (isFormatCorrect) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

// --- Execution Entry Point ---
// The script initiates by reading from standard input.
// Using 'node:fs' for explicit module namespace and object notation for encoding.
analyzeInputFormat(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));