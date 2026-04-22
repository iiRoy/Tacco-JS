function AnalyzeTilePattern(rawInputSequence) {
  // Defensive check: If the input sequence is empty or contains only one character,
  // no adjustments are possible or necessary. Output 0 and exit.
  if (!rawInputSequence || rawInputSequence.length < 2) {
    console.log(0);
    return;
  }

  // Convert the raw input string into an array of individual characters.
  // This provides convenient access to elements by index.
  const patternCharacters = rawInputSequence.split('');

  // Initialize a counter to track the total number of required adjustments or 'flips'.
  // This value represents the final result.
  let necessaryAdjustments = 0;

  // A boolean flag that indicates if the pattern is currently in a 'disrupted' state.
  // A 'disrupted' state implies that a sequence of identical characters has been encountered
  // (e.g., 'AA'), or an alternating pattern has been maintained after such a disruption.
  // When 'true', it means we are within a segment that needs an alternation.
  let isCurrentlyDisrupted = false;

  // Store the length of the character array in a constant for efficient loop iteration.
  const sequenceLength = patternCharacters.length;

  // Iterate through the character sequence, starting from the second element.
  // Each character is compared against its immediate predecessor.
  for (let currentPosition = 1; currentPosition < sequenceLength; currentPosition++) {
    // Extract the character at the current position and the one preceding it for clarity.
    const currentElement = patternCharacters[currentPosition];
    const previousElement = patternCharacters[currentPosition - 1];

    // Determine if the current state requires an increment to 'necessaryAdjustments'
    // and how the 'isCurrentlyDisrupted' flag should transition.
    // The adjustment counter increments under two conditions:
    // 1. A new sequence of identical characters begins while the pattern was previously stable (e.g., 'ABBA').
    // 2. An alternating character is encountered while the pattern was already in a disrupted state (e.g., 'AA' followed by 'AB').
    const shouldIncrementAdjustments =
      (currentElement === previousElement && !isCurrentlyDisrupted) ||
      (currentElement !== previousElement && isCurrentlyDisrupted);

    if (shouldIncrementAdjustments) {
      necessaryAdjustments++;
      // If adjustments were made, the pattern is now considered 'disrupted'
      // (or remains disrupted) as we are actively managing an alternation.
      isCurrentlyDisrupted = true;
    } else {
      // If no adjustments were made, it means either:
      // A) Identical characters continued while already disrupted (e.g., 'AAA' after 'AA'),
      //    which implicitly ends the current disruption cycle in the original logic.
      // B) Different characters were found while the pattern was stable (e.g., 'ABA'),
      //    meaning no new disruption was initiated.
      // In both cases, the pattern is reset to a 'stable' (not disrupted) state.
      isCurrentlyDisrupted = false;
    }
  }

  // Display the final computed number of necessary pattern adjustments.
  console.log(necessaryAdjustments);
}

// Utilize Node.js's file system module to read input.
const fileSystemUtility = require("fs");

// Define the standard input file path, common in competitive programming environments.
const standardInputFile = "/dev/stdin";

// Read the content of the standard input file synchronously.
// The content is decoded as UTF-8 and any leading/trailing whitespace is removed.
// A descriptive variable name is used for the raw data.
const rawInputDataFromConsole = fileSystemUtility.readFileSync(standardInputFile, "utf-8").trim();

// Execute the main pattern analysis function with the collected input data.
AnalyzeTilePattern(rawInputDataFromConsole);