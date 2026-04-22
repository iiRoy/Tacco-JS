const solvePalindromeSubsequencePairs = (rawInputString) => {
  // This function computes a specific sum based on subsequences
  // generated from an input string and its reverse.

  // --- Input Parsing and Initial Validation ---
  // Ensure the raw input is a valid non-empty string.
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    console.error("Input data is either empty, not a string, or contains only whitespace.");
    return; // Exit early if input is invalid
  }

  // Split the raw input into individual lines.
  const inputLines = rawInputString.trim().split('\n');

  // Verify that there are at least two lines of input as expected.
  if (inputLines.length < 2) {
    console.error("Insufficient input lines provided. Expected at least two lines for processing.");
    return; // Exit early
  }

  // Parse the declared length of the sequence from the first line.
  // Using parseInt with radix 10 for explicit conversion.
  const declaredSequenceLength = parseInt(inputLines[0], 10);

  // Validate the parsed length to ensure it's a non-negative integer.
  if (isNaN(declaredSequenceLength) || declaredSequenceLength < 0) {
    console.error("The declared sequence length is invalid. It must be a non-negative integer.");
    return; // Exit early for invalid length
  }

  // Extract the primary string for subsequence generation from the second line.
  const baseStringForCombinations = inputLines[1];

  // Perform a crucial validation: check if the actual string length matches the declared length.
  // If the base string is shorter, it could lead to out-of-bounds access.
  if (baseStringForCombinations.length < declaredSequenceLength) {
    console.error(`Error: The base string provided ("${baseStringForCombinations}") is shorter than the declared length (${declaredSequenceLength}). Aborting.`);
    return; // Exit early to prevent errors
  }
  // If the base string is longer, we will implicitly ignore the extra characters
  // as the loops only go up to `declaredSequenceLength`. This behavior is consistent
  // with the original code's implicit assumption.

  // --- Helper Function Definition ---
  // A utility function to reverse any given string.
  const stringReverser = (inputStr) => {
    // Convert to array of characters, reverse, then join back to a string.
    return inputStr.split('').reverse().join('');
  };

  // --- Core Processing Setup ---
  // Generate the reversed version of the base string.
  const reversedBaseString = stringReverser(baseStringForCombinations);

  // Calculate the total number of unique ways to split the string into two subsequences.
  // This is 2 raised to the power of `declaredSequenceLength`.
  const totalSubsetCombinations = 1 << declaredSequenceLength;

  // Initialize two frequency maps. These will store the counts of unique
  // combined string patterns generated from the base string and its reverse.
  // Using plain JavaScript objects as hash maps for efficiency.
  const forwardPatternFrequencyMap = {};  // Stores patterns from baseString (original 'a')
  const backwardPatternFrequencyMap = {}; // Stores patterns from reversedBaseString (original 'b')

  // --- Subsequence Generation and Pattern Counting Loop ---
  // Iterate through all possible subset combinations.
  // Each `combinationMask` represents a unique way to select characters for the first subsequence.
  for (let combinationMask = 0; combinationMask < totalSubsetCombinations; ++combinationMask) {
    // Arrays to temporarily hold characters for the four subsequences before joining them.
    // Using arrays for building strings in a loop is generally more efficient than repeated string concatenation.
    const primaryLeftSubsequenceChars = [];  // Characters for the first part of the base string
    const primaryRightSubsequenceChars = []; // Characters for the second part of the base string
    const invertedLeftSubsequenceChars = []; // Characters for the first part of the reversed string
    const invertedRightSubsequenceChars = [];// Characters for the second part of the reversed string

    // Iterate through each character position (index) within the string.
    for (let charIndex = 0; charIndex < declaredSequenceLength; ++charIndex) {
      // Check if the bit at `charIndex` is set in the `combinationMask`.
      // If the bit is set, the character at `charIndex` belongs to the "left" part; otherwise, to the "right" part.
      const isBitSetForLeftPart = (combinationMask & (1 << charIndex)) !== 0;

      if (isBitSetForLeftPart) {
        // Add character to the "left" subsequences.
        primaryLeftSubsequenceChars.push(baseStringForCombinations[charIndex]);
        invertedLeftSubsequenceChars.push(reversedBaseString[charIndex]);
      } else {
        // Add character to the "right" subsequences.
        primaryRightSubsequenceChars.push(baseStringForCombinations[charIndex]);
        invertedRightSubsequenceChars.push(reversedBaseString[charIndex]);
      }
    }

    // Join the collected characters to form the final combined string patterns.
    // The patterns are constructed by concatenating the two subsequences with a comma delimiter.
    const currentForwardPattern = primaryLeftSubsequenceChars.join('') + ',' + primaryRightSubsequenceChars.join('');
    const currentBackwardPattern = invertedLeftSubsequenceChars.join('') + ',' + invertedRightSubsequenceChars.join('');

    // Increment the frequency count for each generated pattern in its respective map.
    // This compact syntax handles initialization (to 0) if the key doesn't exist.
    forwardPatternFrequencyMap[currentForwardPattern] = (forwardPatternFrequencyMap[currentForwardPattern] || 0) + 1;
    backwardPatternFrequencyMap[currentBackwardPattern] = (backwardPatternFrequencyMap[currentBackwardPattern] || 0) + 1;
  }

  // --- Final Calculation and Output ---
  let totalProductSum = 0; // Initialize the accumulator for the final result.

  // Iterate over each unique pattern key found in the forward frequency map.
  for (const patternIdentifier in forwardPatternFrequencyMap) {
    // It's good practice to ensure the key is an actual property of the object
    // and not from its prototype chain, especially when iterating with `for...in`.
    if (Object.prototype.hasOwnProperty.call(forwardPatternFrequencyMap, patternIdentifier)) {
      // Retrieve the frequency of the current pattern from the forward map.
      const forwardCount = forwardPatternFrequencyMap[patternIdentifier];

      // Check if this exact pattern also exists in the backward frequency map.
      // If it exists, retrieve its count; otherwise, it effectively has a count of zero.
      if (backwardPatternFrequencyMap[patternIdentifier]) {
        const backwardCount = backwardPatternFrequencyMap[patternIdentifier];
        // Add the product of the two frequencies to the running total.
        totalProductSum += forwardCount * backwardCount;
      }
    }
  }

  // Print the final computed sum to the console.
  console.log(totalProductSum);
};

// --- Entry Point for Execution ---
// This block handles reading input from standard input and invoking the solver.
try {
  // Require the Node.js file system module to read from stdin.
  const fileSystemModule = require("fs");
  // Read all data from standard input, decoded as UTF-8.
  const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Call the main processing function with the obtained input.
  solvePalindromeSubsequencePairs(standardInputData);
} catch (executionError) {
  // Catch and log any errors that occur during file reading or function execution.
  console.error("An error occurred during input processing or execution:", executionError.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}