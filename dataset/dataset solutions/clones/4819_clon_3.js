/**
 * Determines if the first character of the given input string is a vowel or a consonant.
 * This function processes only the very first character after trimming whitespace and converting to lowercase.
 * Any non-alphabetic character or empty input will result in 'consonant' classification
 * if it's not one of the explicitly checked vowels.
 *
 * @param {string} receivedInputString The string data received, typically from standard input.
 */
function analyzeInputCharacter(receivedInputString) {

  // Define a set of lowercase vowels for efficient lookup.
  // This is an added helper data structure for improved readability and potential performance
  // compared to a long chain of '||' operators.
  const knownVowels = new Set(['a', 'e', 'i', 'o', 'u']);

  // Ensure the input is treated as a string, trim any leading/trailing whitespace,
  // convert it to lowercase for case-insensitive comparison, and then explicitly
  // get the very first character. This adds robustness and clarity to input handling.
  const currentCharacter = String(receivedInputString)
    .trim()
    .toLowerCase()
    .charAt(0);

  let classificationResult; // An intermediate variable to hold the determined outcome.

  // Guard clause: Check if after processing (trimming, etc.), no character remains.
  // This handles cases like empty input or input consisting only of whitespace.
  // The original code would implicitly classify an empty string as a 'consonant'
  // because '' is not equal to any vowel. We explicitly set it here for clarity.
  if (!currentCharacter) {
    classificationResult = 'consonant'; // Consistent with original behavior for non-vowels.
  } else {
    // Check if the processed single character is present in our defined set of vowels.
    // This replaces the repetitive series of '===' checks.
    if (knownVowels.has(currentCharacter)) {
      classificationResult = 'vowel';
    } else {
      classificationResult = 'consonant';
    }
  }

  // Output the final determined classification to the console.
  console.log(classificationResult);

}

// --- Input Handling Section ---
// This part is responsible for reading data from standard input and
// initiating the character classification process.
// The raw input buffer is first stored in a constant for better traceability.
const standardInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the primary character classification logic with the data
// obtained from the standard input stream.
analyzeInputCharacter(standardInputBuffer);