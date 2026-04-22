// This program processes input data from standard input, performing a series of transformations
// and comparisons on blocks of strings. It's designed to identify a specific metric
// related to common prefixes after a custom string modification and sorting routine.

// Import the Node.js file system module for reading input synchronously.
const fileSystemInterface = require("fs");

// Define the path to standard input. Using a constant improves clarity.
const stdInputSource = "/dev/stdin";

// Read the entire content of the standard input stream as a UTF-8 encoded string.
// This will contain all test cases concatenated.
let rawInputContent = fileSystemInterface.readFileSync(stdInputSource, "utf8");

// Split the monolithic input string into an array of individual lines.
// Each line represents a distinct piece of data (either a count or a string).
let inputLinesArray = rawInputContent.split("\n");

// Initialize an integer pointer to keep track of the current line being processed
// from the `inputLinesArray`.
let currentLinePointer = 0;

// Outer loop: Processes data blocks until a termination condition is met.
// Each iteration handles one test case.
while (true) {
  // Read the first number of the current block, which indicates how many
  // subsequent strings belong to this test case. The unary plus converts to a number.
  const numberOfStringsInBlock = +inputLinesArray[currentLinePointer++];

  // Termination condition: If the number of strings is zero,
  // it signifies the end of all test cases.
  if (numberOfStringsInBlock === 0) {
    break; // Exit the main processing loop.
  }

  // An array to temporarily hold the raw strings for the current block.
  let currentBlockStrings = [];

  // Populate the array with `numberOfStringsInBlock` lines following the count.
  for (let stringIndex = 0; stringIndex < numberOfStringsInBlock; ++stringIndex) {
    currentBlockStrings.push(inputLinesArray[currentLinePointer++]);
  }

  /**
   * Transforms an input string based on a specific vowel-dependent rule.
   * The rule is: keep the first character. For any subsequent character,
   * keep it only if the immediately preceding character (in the original string) was a vowel.
   *
   * @param {string} originalText The string to be transformed.
   * @returns {string} The transformed string.
   */
  const applyVowelConditionalFilter = (originalText) => {
    // Edge case: if the input string is empty, return an empty string.
    if (originalText.length === 0) {
      return "";
    }

    // Helper function to determine if a character is a vowel (case-insensitive).
    const isCharVowel = (charToCheck) => /[aeiou]/.test(charToCheck.toLowerCase());

    // Initialize an array to build the new string. The first character is always included.
    let filteredCharacters = [originalText[0]];

    // Iterate through the original string starting from the second character.
    for (let charPosition = 1; charPosition < originalText.length; ++charPosition) {
      // Check if the character *before* the current one was a vowel.
      if (isCharVowel(originalText[charPosition - 1])) {
        // If the preceding character was a vowel, append the current character.
        filteredCharacters.push(originalText[charPosition]);
      }
    }
    // Join all collected characters to form the final transformed string.
    return filteredCharacters.join("");
  };

  // Apply the custom transformation rule to each string in the current block.
  // The `map` method creates a new array with the results.
  let processedAndFilteredStrings = currentBlockStrings.map(applyVowelConditionalFilter);

  // Sort the array of processed strings alphabetically. This is a prerequisite
  // for the subsequent common prefix calculation.
  processedAndFilteredStrings.sort();

  /**
   * Calculates the length of the longest common prefix between two strings.
   * Returns -1 if the two strings are identical.
   *
   * @param {string} firstString The first string for comparison.
   * @param {string} secondString The second string for comparison.
   * @returns {number} The length of the common prefix, or -1 if strings are identical.
   */
  const findCommonPrefixLength = (firstString, secondString) => {
    // If both strings are exactly the same, return -1 as a special indicator.
    if (firstString === secondString) {
      return -1;
    }

    // Determine the shorter length to prevent out-of-bounds access during comparison.
    const shortestLength = Math.min(firstString.length, secondString.length);

    // Iterate character by character until a mismatch is found or the shorter string ends.
    for (let charIterator = 0; charIterator < shortestLength; ++charIterator) {
      if (firstString[charIterator] !== secondString[charIterator]) {
        return charIterator; // Return the index of the first mismatch, which is the prefix length.
      }
    }
    // If the loop completes, it means one string is a prefix of the other.
    // The common prefix length is simply the length of the shorter string.
    return shortestLength;
  };

  // Initialize a variable to track the maximum common prefix length found across adjacent pairs.
  // It starts at 0, as per the problem's base requirement.
  let overallMaxCommonPrefix = 0;

  // Iterate through the sorted array of processed strings, comparing each string
  // with its immediate predecessor. The loop starts from the second element.
  for (let currentStringIdx = 1; currentStringIdx < numberOfStringsInBlock; ++currentStringIdx) {
    const previousStringInSequence = processedAndFilteredStrings[currentStringIdx - 1];
    const currentStringInSequence = processedAndFilteredStrings[currentStringIdx];

    // Calculate the common prefix length for the current adjacent pair.
    const currentPairPrefix = findCommonPrefixLength(
      previousStringInSequence,
      currentStringInSequence
    );

    // Special handling for identical strings: if `findCommonPrefixLength` returns -1,
    // it indicates a full match. The problem requires setting the result to -2 in this case
    // and breaking, as this condition overrides any other common prefix length.
    if (currentPairPrefix === -1) {
      overallMaxCommonPrefix = -2; // Indicates a duplicate entry was found.
      break; // No further comparisons are needed for this block.
    }

    // If the current common prefix length is greater than the previously recorded maximum, update it.
    if (currentPairPrefix > overallMaxCommonPrefix) {
      overallMaxCommonPrefix = currentPairPrefix;
    }
  }

  // Output the final calculated maximum common prefix length, incremented by one.
  // This increment is a specific requirement of the problem's output format.
  console.log(overallMaxCommonPrefix + 1);
}