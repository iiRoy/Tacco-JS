const emitResult = (messagePayload) => {
  process.stdout.write(String(messagePayload) + '\n');
};

/**
 * Analyzes an incoming text string to determine if it conforms to a specific
 * character pairing pattern.
 * The pattern requires the 3rd and 4th characters to be identical,
 * AND the 5th and 6th characters to also be identical.
 *
 * @param {string} sourcePayload The raw input string, potentially multi-line.
 */
function evaluateCharacterSeries(sourcePayload) {
  // Input integrity check: Ensure we're working with a string.
  if (typeof sourcePayload !== 'string') {
    emitResult('Input processing error: Data format is not a string.');
    return;
  }

  // Step 1: Pre-process the raw input.
  // We're interested in the first significant line.
  const contentLines = sourcePayload.trim().split('\n');

  // Early exit condition 1: No valid lines or the first line is too short.
  // We need at least 6 characters for indices 2, 3, 4, 5.
  if (!contentLines.length || contentLines[0].length < 6) {
    emitResult('No'); // Insufficient data to form the required pattern.
    return;
  }

  // Step 2: Convert the primary line into an array of individual characters.
  const charArray = Array.from(contentLines[0]);

  // Define target indices for clarity and potential future modification.
  const indexForFirstCharOfFirstPair = 2; // Corresponds to original str[2]
  const indexForSecondCharOfFirstPair = 3; // Corresponds to original str[3]
  const indexForFirstCharOfSecondPair = 4; // Corresponds to original str[4]
  const indexForSecondCharOfSecondPair = 5; // Corresponds to original str[5]

  // Early exit condition 2: Ensure the character array is long enough for all required indices.
  if (charArray.length <= indexForSecondCharOfSecondPair) {
      emitResult('No'); // Array too short for the full set of comparisons.
      return;
  }

  // Step 3: Extract the characters at the specified positions.
  const charA = charArray[indexForFirstCharOfFirstPair];
  const charB = charArray[indexForSecondCharOfFirstPair];
  const charC = charArray[indexForFirstCharOfSecondPair];
  const charD = charArray[indexForSecondCharOfSecondPair];

  // Step 4: Evaluate the two independent conditions.
  const areFirstTwoAdjacentEqual = (charA === charB);
  const areNextTwoAdjacentEqual = (charC === charD);

  // Step 5: Combine the conditions for the final decision.
  const isPatternFullyMatched = areFirstTwoAdjacentEqual && areNextTwoAdjacentEqual;

  // Step 6: Output the result.
  emitResult(isPatternFullyMatched ? 'Yes' : 'No');
}

// The following self-executing anonymous function manages the input source.
// This design allows for flexible input fetching, common in competitive programming setups.
(function initializeApplication() {
  let acquiredInputData;

  try {
    // Attempt to read input from the standard input stream, typical for online judges.
    acquiredInputData = require("fs").readFileSync("/dev/stdin", "utf8");
  } catch (inputError) {
    // If reading from stdin fails (e.g., local execution without piping),
    // provide a default test case and log the error for debugging.
    console.warn("Input acquisition failed, falling back to a default test string. Error:", inputError.message);
    acquiredInputData = "xyzzyx\nabccdd\n"; // Example: Should result in "Yes"
  }

  // Pass the acquired data to the core logic function for analysis.
  evaluateCharacterSeries(acquiredInputData);
})();