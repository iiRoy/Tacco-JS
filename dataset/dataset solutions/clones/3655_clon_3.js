// This program evaluates whether the first line of an input text
// is the exact reverse of the second line.
// It processes raw textual data, typically from standard input.
function evaluateStringReversal(sourceTextData) {
  // Normalize the input by removing any leading or trailing whitespace
  // from the entire block of text.
  const processedData = sourceTextData.trim();

  // Break down the cleaned input into an array of individual lines.
  // This ensures that string splitting occurs only once.
  const textSegments = processedData.split('\n');

  // --- structural addition: guard clause for insufficient data ---
  // If there aren't at least two distinct lines, a comparison cannot be made.
  // In such a scenario, it's definitively not a reverse match.
  if (textSegments.length < 2) {
    console.log("No");
    return;
  }

  // Designate the string from the first line as the primary sequence for analysis.
  const primarySequence = textSegments[0];
  // Designate the string from the second line as the sequence to compare against.
  const comparativeSequence = textSegments[1];

  // --- structural addition: early exit for length mismatch ---
  // A fundamental requirement for one string to be the reverse of another
  // is that they must have identical lengths. If not, an immediate "No" is warranted.
  if (primarySequence.length !== comparativeSequence.length) {
    console.log("No");
    return;
  }

  // Store the length of the primary sequence in a constant for efficiency,
  // avoiding repetitive property access within the loop.
  const sequenceDimension = primarySequence.length;

  // --- structural update: replace counter with boolean flag for state tracking ---
  // Initialize a flag to assume a perfect reverse match.
  // This flag will be set to 'false' upon the first detected discrepancy.
  let isReverseEquivalent = true;

  // Iterate through the primary sequence, character by character, from start to end.
  for (let charIndex = 0; charIndex < sequenceDimension; charIndex++) {
    // Retrieve the character from the primary sequence at the current forward index.
    // NOTE: This corrects a common JavaScript syntax error from `charAt[i]` to `charAt(i)`.
    const currentPrimaryChar = primarySequence.charAt(charIndex);

    // Retrieve the character from the comparative sequence at the corresponding
    // reverse index. For instance, the first character of primarySequence
    // is compared with the last character of comparativeSequence, and so on.
    const currentComparativeCharReversed = comparativeSequence.charAt(sequenceDimension - 1 - charIndex);

    // --- structural update: directly check for mismatch and break early ---
    // If the characters at the respective forward and reverse positions do not match,
    // then the strings are not reverse equivalents.
    if (currentPrimaryChar !== currentComparativeCharReversed) {
      isReverseEquivalent = false; // Mark the mismatch.
      // --- structural addition: early loop termination ---
      // Once a single mismatch is found, further comparisons are redundant.
      // Exit the loop immediately.
      break;
    }
    // The original empty 'if' block is deleted as its purpose is now covered
    // by the direct mismatch check and early exit.
  }

  // --- structural update: streamline output generation ---
  // Based on the final state of the boolean flag, construct the appropriate message.
  const finalOutcomeMessage = isReverseEquivalent ? "Yes" : "No";
  // Display the result to the console.
  console.log(finalOutcomeMessage);
}

// --- structural addition: intermediate variable for file system operation ---
// Read the entire content of standard input synchronously,
// using UTF-8 encoding for text interpretation.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Execute the main string reversal evaluation function with the obtained input.
evaluateStringReversal(standardInputContent);