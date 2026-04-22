// This module defines a mechanism to analyze an input string against a predefined pattern.
// Specifically, it determines if the input string can be formed by a prefix of 'keyence',
// followed by an arbitrary sequence of characters (a "gap"), and then a suffix of 'keyence'.
// A critical constraint is that once the suffix matching begins after a gap, no further mismatches are allowed.

/**
 * Processes an array of raw input segments, typically lines from standard input,
 * to determine if the first line matches the "keyence string" pattern.
 *
 * @param {string[]} rawDataSegments An array where the first element is the string to be analyzed.
 */
function analyzeSequence(rawDataSegments) {
  // Input validation: Ensure the input array is valid and contains at least one string.
  if (!Array.isArray(rawDataSegments) || rawDataSegments.length === 0 || typeof rawDataSegments[0] !== 'string') {
    console.log('NO'); // Invalid input cannot match the pattern.
    return;
  }

  const processedStringLine = rawDataSegments[0]; // The primary string for analysis.
  const targetWord = 'keyence'; // The immutable target sequence.
  const targetWordLength = targetWord.length; // Pre-calculate length for performance.
  const inputLineLength = processedStringLine.length; // Pre-calculate length for performance.

  // Initial guard clause: If the input line is shorter than the target word,
  // it's impossible to form the target word, even with an empty gap.
  if (inputLineLength < targetWordLength) {
    console.log('NO');
    return;
  }

  let currentTargetCharIdx = 0; // Pointer for the current character in 'targetWord'.
  let gapPhaseActive = false; // Flag becomes true once the first mismatch (gap) is encountered.
  let lastCharMatched = true; // True if the character at (currentLineCharIdx - 1) in processedStringLine matched its target.
                              // Initially true, as there's no character before the first.

  let isMatchOutcome = false; // Stores the final boolean result of the analysis.
  let earlyExitTriggered = false; // Set to true if a 'NO' condition is met mid-loop.

  // Iterate through each character of the input string to find the pattern.
  for (let currentLineCharIdx = 0; currentLineCharIdx < inputLineLength; currentLineCharIdx++) {
    const currentInputChar = processedStringLine[currentLineCharIdx];
    const expectedTargetChar = targetWord[currentTargetCharIdx];

    // Check if the current character from the input line matches the expected character
    // from the 'targetWord' sequence.
    if (currentInputChar === expectedTargetChar) {
      currentTargetCharIdx++; // Advance the target word pointer.
      lastCharMatched = true; // Indicate that the current character was a match.
    } else {
      // A mismatch has occurred.
      // This is the critical "NO" condition: if the *previous* character was a match
      // AND we are already in a gap phase, it means we encountered a second gap
      // or a mismatch after resuming a suffix match. This is disallowed.
      if (lastCharMatched && gapPhaseActive) {
        earlyExitTriggered = true; // Mark for an immediate 'NO' outcome.
        break; // Terminate the loop early.
      }
      lastCharMatched = false; // Indicate that the current character was a mismatch.
      gapPhaseActive = true; // Activate the gap phase, as a mismatch has now been seen.
    }
  }

  // After the loop, evaluate the final state to determine the overall match outcome.
  if (earlyExitTriggered) {
    // If the loop was terminated early due to an invalid pattern sequence.
    isMatchOutcome = false;
  } else if (currentTargetCharIdx === targetWordLength) {
    // If all characters of the target word were successfully matched in sequence.
    isMatchOutcome = true;
  } else {
    // If the loop finished but not all target word characters were matched.
    isMatchOutcome = false;
  }

  // Output the final YES/NO verdict.
  if (isMatchOutcome) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

// Global variable to accumulate incoming data from standard input.
let receivedInputData = '';

// Configure standard input stream.
process.stdin.resume(); // Ensures the process stays active to receive input.
process.stdin.setEncoding('utf8'); // Specifies UTF-8 encoding for input data.

// Event listener for 'data' chunks received from stdin.
// Appends each incoming data chunk to the 'receivedInputData' string.
process.stdin.on('data', function(incomingChunk) {
  receivedInputData += incomingChunk;
});

// Event listener for the 'end' of the stdin stream.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines based on newline characters.
  const parsedLines = receivedInputData.split('\n');
  // Invoke the main analysis function with the processed input lines.
  analyzeSequence(parsedLines);
});