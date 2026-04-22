/**
 * This module is designed to assess the numerical balance of specific
 * lowercase English characters ('a', 'b', 'c') within an incoming text stream.
 * It determines if the distribution of these characters is sufficiently
 * uniform based on a defined threshold.
 */

/**
 * Analyzes the provided text content to determine if the frequencies of
 * the initial three lowercase English letters ('a', 'b', 'c') are balanced.
 * Balance is achieved if the absolute difference between the highest and
 * lowest observed frequencies among these three characters is less than two.
 *
 * @param {string} sourceStringContent - The raw string data read from an input source.
 * @returns {string} - Returns "YES" if the character frequencies are balanced,
 *                     otherwise returns "NO".
 */
function analyzeCharacterFrequencyBalance(sourceStringContent) {
  // Define a constant for the ASCII value of 'a' to facilitate index calculations.
  const BASE_ASCII_CODE_FOR_A = 'a'.charCodeAt(0);
  // Define the number of specific characters we are tracking (i.e., 'a', 'b', 'c').
  const COUNT_OF_TARGET_CHARS = 3;

  // --- Stage 1: Initial Data Preparation and Validation ---
  // Clean the input string by removing any leading or trailing whitespace.
  const trimmedInputText = sourceStringContent.trim();

  // Implement a foundational check: if the processed string is empty,
  // all character counts would be zero, leading to a difference of zero.
  // A difference of zero is less than two, thus considered balanced.
  if (trimmedInputText.length === 0) {
    return "YES";
  }

  // --- Stage 2: Character Occurrence Tallying ---
  // Initialize a frequency array for 'a', 'b', and 'c'.
  // Each index corresponds to a character: 0 for 'a', 1 for 'b', 2 for 'c'.
  const charFrequencyMap = new Array(COUNT_OF_TARGET_CHARS).fill(0);

  // Iterate through each character of the cleaned input string.
  for (let charIndexInString = 0; charIndexInString < trimmedInputText.length; charIndexInString++) {
    const currentCharacter = trimmedInputText[charIndexInString];
    const currentCharacterAsciiValue = currentCharacter.charCodeAt(0);

    // Calculate the relative index for the character based on 'a'.
    const relativeCharOffset = currentCharacterAsciiValue - BASE_ASCII_CODE_FOR_A;

    // Conditionally increment the count only if the character is one of our targets ('a', 'b', 'c').
    // This ensures that other characters (like 'd', 'z', numbers, symbols, etc.) are ignored.
    if (relativeCharOffset >= 0 && relativeCharOffset < COUNT_OF_TARGET_CHARS) {
      charFrequencyMap[relativeCharOffset]++;
    }
  }

  // --- Stage 3: Determining Extremes in Frequencies ---
  // Initialize variables to track the highest and lowest frequencies found.
  // Start `highestCount` at -1 to ensure any non-negative count becomes the max.
  // Start `lowestCount` at Infinity to ensure any finite count becomes the min.
  let highestCount = -1;
  let lowestCount = Infinity;

  // Traverse the frequency map to identify the maximum and minimum counts.
  for (const frequencyValue of charFrequencyMap) {
    // Update the highest frequency if the current value is greater.
    if (frequencyValue > highestCount) {
      highestCount = frequencyValue;
    }
    // Update the lowest frequency if the current value is smaller.
    if (frequencyValue < lowestCount) {
      lowestCount = frequencyValue;
    }
  }

  // --- Stage 4: Final Balance Assessment ---
  // Calculate the difference between the most and least frequent characters.
  const frequencyRange = highestCount - lowestCount;

  // The condition for a "balanced" state is if this range is strictly less than 2.
  // This means the range can be 0 or 1.
  if (frequencyRange < 2) {
    return "YES"; // The character counts are considered balanced.
  } else {
    return "NO";  // The character counts are not balanced.
  }
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream
// and printing the result of the balance analysis.
try {
  // Utilize Node.js 'fs' module to synchronously read all data from /dev/stdin.
  // The 'utf8' encoding ensures correct character interpretation.
  const rawInputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Invoke the primary analysis function with the obtained input.
  const assessmentResult = analyzeCharacterFrequencyBalance(rawInputPayload);

  // Output the final determination to the standard output.
  console.log(assessmentResult);
} catch (executionError) {
  // Provide basic error reporting if any issues occur during file reading or processing.
  console.error("An operational error was encountered:", executionError.message);
  // In a production environment, one might also exit with a non-zero status code.
  // process.exit(1);
}