/*
 * This module provides a utility function to analyze a given string,
 * typically expected to contain numeric characters. It performs two
 * distinct checks to determine if a specific 'Yes' condition is met.
 *
 * The first condition is a direct comparison against a predefined critical string.
 * The second condition involves iterating through single-digit numbers (1 through 9)
 * and counting their occurrences within the input string. If any digit appears
 * more than a specified threshold number of times, the 'Yes' condition is triggered.
 *
 * The function outputs 'Yes' if either of these conditions is satisfied,
 * otherwise, it outputs 'No'.
 */
function analyzeNumericString(incomingText) {
  // Define a constant for the specific string value that immediately triggers a 'Yes'.
  const CRITICAL_YES_PHRASE = '1000';
  let hasMetPositiveCriterion = false; // A boolean flag to track if any 'Yes' condition is found.

  // --- Assessment Stage 1: Direct comparison for the critical phrase ---
  // This is an initial, quick check for a specific, high-priority pattern.
  // An early check can optimize performance for this particular case.
  if (incomingText === CRITICAL_YES_PHRASE) {
    hasMetPositiveCriterion = true;
    // console.log("Diagnostic: Identified the primary critical phrase."); // Example of a temporary diagnostic fragment
  }

  // --- Assessment Stage 2: Iterative digit frequency analysis ---
  // This stage is only executed if the first condition has not already yielded a 'Yes'.
  // We'll use a traditional loop structure to examine digits from 1 up to 9.
  if (!hasMetPositiveCriterion) {
    let currentNumericalChar = 1; // Start checking from the digit '1'.
    const MAXIMUM_DIGIT_FOR_CHECK = 9; // The upper bound for digits to be examined.
    const REPETITION_LIMIT = 2; // The threshold: if a digit appears more than this, it's a 'Yes'.

    // Loop through each digit from the lower bound to the upper bound.
    while (currentNumericalChar <= MAXIMUM_DIGIT_FOR_CHECK) {
      // Construct a regular expression dynamically for the current digit.
      // The 'g' flag ensures that all occurrences are matched, not just the first.
      const digitSearchRegex = new RegExp(`${currentNumericalChar}`, 'g');

      // Execute the regular expression against the input string to find all matches.
      // The `match()` method returns an array of matches or `null` if no matches are found.
      const collectedMatches = incomingText.match(digitSearchRegex);

      // Proceed only if the current digit was found at least once in the string.
      if (collectedMatches !== null) {
        const countOfMatches = collectedMatches.length;

        // If the number of times this digit appears exceeds our predefined limit,
        // then the positive criterion has been met.
        if (countOfMatches > REPETITION_LIMIT) {
          hasMetPositiveCriterion = true;
          // console.log(`Diagnostic: Digit '${currentNumericalChar}' appeared ${countOfMatches} times, exceeding limit.`); // Another diagnostic fragment
          break; // Exit the loop immediately, as a 'Yes' condition is confirmed.
        }
      }

      currentNumericalChar++; // Increment to check the next digit.
    }
  }

  // --- Final Output Determination ---
  // Based on the flag, print 'Yes' or 'No'. Using a ternary operator for conciseness.
  const finalOutcomeMessage = hasMetPositiveCriterion ? 'Yes' : 'No';
  console.log(finalOutcomeMessage);
}

// --- Input Acquisition and Execution Block ---
// This section is responsible for reading the input data and invoking the main analysis function.
let dataSourceContent = '';
try {
  // Attempt to load the Node.js 'fs' (file system) module.
  // This is typical in environments like competitive programming platforms.
  const fileSystemUtility = require("fs");
  // Read the content from standard input, decode as UTF-8, and remove leading/trailing whitespace.
  dataSourceContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8").trim();
} catch (dataReadError) {
  // If there's an error reading from /dev/stdin (e.g., file not found, no fs module),
  // a fallback mechanism is provided. This could be for local testing or non-standard environments.
  // For a Type III clone, this error handling is an added fragment.
  // console.error("Error encountered while attempting to read input:", dataReadError.message);
  // Default to an empty string or a predefined test value if input reading fails.
  // An environment variable could also supply test data.
  dataSourceContent = process.env.ALT_INPUT_STRING || '';
}

// Execute the primary analysis function with the obtained input data.
analyzeNumericString(dataSourceContent);