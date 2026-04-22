// Utility for identifying numeric subsequences within a larger digit stream.
// This module implements a pattern-matching algorithm, heavily refactored
// from its original competitive programming context (SMPG2019 - D).

/**
 * Analyzes a given raw input string to determine the total count of specific
 * 3-digit numeric patterns found as subsequences within a target digit sequence.
 *
 * @param {string} rawInput - The complete input string. It is expected to contain
 *                            at least two lines. The second line should be the
 *                            string of digits to be analyzed.
 */
const analyzeDigitStream = (rawInput) => {
  // --- Input Processing and Validation ---
  if (typeof rawInput !== 'string' || rawInput.trim() === '') {
    console.error("Error: Provided input is empty, null, or not a string type.");
    return; // Terminate execution for invalid input.
  }

  const inputLines = rawInput.trim().split('\n');

  // Ensure that there are enough lines in the input to extract the target sequence.
  if (inputLines.length < 2) {
    console.error("Error: Input does not contain the expected number of lines. At least two lines are required.");
    return;
  }

  // Convert the relevant input line (the second one) into an array of integer digits.
  // This uses a traditional loop for structural variation from common array methods.
  const mainSequenceDigits = [];
  const rawDigitString = inputLines[1];
  for (let charIndex = 0; charIndex < rawDigitString.length; charIndex++) {
    const digitCharacter = rawDigitString[charIndex];
    const numericValue = parseInt(digitCharacter, 10);

    // Only add valid digits to the sequence, ignoring non-numeric characters.
    if (!isNaN(numericValue)) {
      mainSequenceDigits.push(numericValue);
    }
  }

  // --- Pattern Generation ---
  // Define the fixed length for the patterns we are seeking.
  const PATTERN_DIGIT_LENGTH = 3;

  // Generate all possible numeric patterns of the defined length (e.g., 000 through 999).
  // This generation method uses nested loops, providing a structural alternative
  // to string manipulation and mapping.
  const candidatePatterns = [];
  for (let digitOne = 0; digitOne <= 9; digitOne++) {
    for (let digitTwo = 0; digitTwo <= 9; digitTwo++) {
      for (let digitThree = 0; digitThree <= 9; digitThree++) {
        candidatePatterns.push([digitOne, digitTwo, digitThree]);
      }
    }
  }

  // --- Subsequence Matching Logic ---
  let totalMatchesFound = 0; // Initialize the counter for successfully identified patterns.

  // Iterate over each distinct candidate pattern.
  for (const currentCandidatePattern of candidatePatterns) {
    let currentPatternMatchProgress = 0; // Tracks how many digits of the current pattern have been matched.

    // Iterate through each digit in the main input sequence.
    for (let sequencePosition = 0; sequencePosition < mainSequenceDigits.length; sequencePosition++) {
      const currentInputDigit = mainSequenceDigits[sequencePosition];

      // Optimization/Guard: If the current pattern has already been fully matched
      // within this iteration of the main sequence, there's no need to check
      // further digits for THIS specific candidate pattern. The original logic
      // would effectively skip subsequent checks too, as `undefined` would not match.
      if (currentPatternMatchProgress === PATTERN_DIGIT_LENGTH) {
        continue; // Move to the next digit in the main sequence.
      }

      // Compare the current input digit with the expected digit from the pattern.
      if (currentInputDigit === currentCandidatePattern[currentPatternMatchProgress]) {
        currentPatternMatchProgress++; // Advance the match pointer for this pattern.

        // If the pattern's match pointer has reached its full length,
        // it signifies that the complete pattern has been found as a subsequence.
        if (currentPatternMatchProgress === PATTERN_DIGIT_LENGTH) {
          totalMatchesFound++; // Increment the global counter.
          // IMPORTANT: The `currentPatternMatchProgress` is NOT reset here.
          // This behavior ensures that each pattern is counted only once per
          // successful subsequence identification within the main sequence.
          // For example, finding [1,2,3] in [1,2,3,1,2,3] still results in a count of 1 for [1,2,3].
        }
      }
    }
  }

  // --- Output Result ---
  console.log(totalMatchesFound);
};

// Execution entry point: Reads input from standard input and processes it.
// This assumes a Node.js environment for file system access.
analyzeDigitStream(require('fs').readFileSync('/dev/stdin', 'utf8'));