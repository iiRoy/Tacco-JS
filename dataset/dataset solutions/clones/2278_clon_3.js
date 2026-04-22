// This script is designed to meticulously scan provided text input
// to determine the frequency of a specific character sequence.

function analyzeTextForPattern(receivedRawData) {
  // Sanitize and split the incoming raw data into individual lines.
  // The .trim() ensures no extraneous whitespace affects line parsing.
  const processedLines = receivedRawData.trim().split('\n');

  // A preliminary check to ensure the input structure is as expected.
  // We need at least two lines: one for the numeric value and one for the text.
  if (processedLines.length < 2) {
    console.error("Input data is incomplete; expected at least two lines.");
    return; // Terminate execution if input format is incorrect.
  }

  // The first line often contains supplementary numeric data,
  // which we parse here for completeness, though it's not directly
  // utilized in the core pattern-matching algorithm in this specific variant.
  const sequenceNumericValue = Number(processedLines[0]); // Converts string to number.

  // The second line is the primary string where we will search for our pattern.
  const sourceText = processedLines[1];

  // Define the exact character sequence that we intend to locate.
  const targetSubsequence = "ABC";
  const requiredPatternLength = targetSubsequence.length;

  // Initialize a counter to keep track of how many times the pattern is found.
  let countOfMatches = 0;

  // Perform a sliding window scan across the source text.
  // The loop iterates until the remaining text is shorter than the pattern length,
  // ensuring we always attempt to extract a full-length segment.
  for (let currentPosition = 0; currentPosition <= sourceText.length - requiredPatternLength; currentPosition++) {
    // Extract a segment of the source text, starting from the current position,
    // with a length equal to our target pattern.
    const currentSegmentToEvaluate = sourceText.substring(currentPosition, currentPosition + requiredPatternLength);

    // Compare the extracted segment with our predefined target pattern.
    if (currentSegmentToEvaluate === targetSubsequence) {
      // If a match is found, increment the occurrence counter.
      countOfMatches++;
    }
  }

  // Output the final tally of pattern occurrences to the console.
  console.log(countOfMatches);
}

// This block serves as the application's entry point.
// It reads data from standard input and then initiates the pattern analysis.
try {
  // Read the entire content from the standard input stream,
  // interpreting it as UTF-8 encoded text.
  const inputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the acquired input to our primary analysis function.
  analyzeTextForPattern(inputBuffer);
} catch (inputReadError) {
  // In case of any errors during input reading (e.g., file not found, permission issues),
  // log an error message to the console.
  console.error("An error occurred while attempting to read from stdin:", inputReadError.message);
}