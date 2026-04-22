// This JavaScript program processes character sequences to compute
// a specific "dissimilarity" score based on character uniqueness at
// corresponding positions across three input lines.

// Define constants for robust file handling and string operations.
const INPUT_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING = 'utf8';
const LINE_BREAK_CHAR = '\n';

// --- Input Reading and Initial Processing ---

// Declare a variable to hold the raw content read from the standard input.
// Using 'let' to allow for potential re-assignment or scoping flexibility.
let rawStreamData;

// Attempt to synchronously read the input file.
// A try-catch block provides basic error handling for file I/O operations.
try {
  rawStreamData = require('fs').readFileSync(INPUT_SOURCE_PATH, TEXT_ENCODING);
} catch (fileReadError) {
  // If reading fails, log an error message and terminate the process.
  console.error(`Error encountered while accessing input stream: ${fileReadError.message}`);
  process.exit(1); // Indicate abnormal termination.
}

// Split the raw data into an array of lines.
// The .filter() method is used to remove any empty strings that might result
// from trailing newlines or multiple consecutive newlines in the input.
const parsedInputLines = rawStreamData.split(LINE_BREAK_CHAR).filter(entry => entry.length > 0);

// --- Input Validation ---

// Ensure a minimum number of lines are present for processing.
// We expect at least one line for the length and three for the character sequences.
const MIN_EXPECTED_LINES = 4;
if (parsedInputLines.length < MIN_EXPECTED_LINES) {
  console.error(`Insufficient data provided. Expected at least ${MIN_EXPECTED_LINES} lines, but received ${parsedInputLines.length}.`);
  process.exit(1);
}

// Parse the declared length of the character sequences from the first line.
// `parseInt` is used with a radix (10) for explicit base conversion, enhancing robustness.
const expectedSequenceLength = parseInt(parsedInputLines[0], 10);

// Validate the parsed length to ensure it's a valid non-negative integer.
if (isNaN(expectedSequenceLength) || expectedSequenceLength < 0) {
  console.error(`Invalid sequence length value: '${parsedInputLines[0]}'. Must be a non-negative integer.`);
  process.exit(1);
}

// --- Sequence Extraction ---

// Extract the three character sequences from the subsequent lines.
// Each line is converted into an array of individual characters for indexed access.
const sequenceAlpha = parsedInputLines[1].split('');
const sequenceBeta = parsedInputLines[2].split('');
const sequenceGamma = parsedInputLines[3].split('');

// Optional: Add a warning if the actual sequence lengths do not match the declared length.
// The loop will still iterate up to `expectedSequenceLength`.
if (sequenceAlpha.length !== expectedSequenceLength ||
    sequenceBeta.length !== expectedSequenceLength ||
    sequenceGamma.length !== expectedSequenceLength) {
  console.warn("Warning: The declared sequence length on the first line does not match the actual length of one or more character sequences.");
  console.warn(`Declared: ${expectedSequenceLength}, Actual: Alpha=${sequenceAlpha.length}, Beta=${sequenceBeta.length}, Gamma=${sequenceGamma.length}`);
}

// --- Core Logic: Dissimilarity Calculation ---

// Initialize a counter for the total number of required operations.
// This counter accumulates scores based on character uniqueness at each position.
let totalModificationScore = 0;

/**
 * Determines the number of unique characters among three provided characters.
 * This helper function encapsulates the logic for checking distinctness.
 * @param {string} charOne - The first character.
 * @param {string} charTwo - The second character.
 * @param {string} charThree - The third character.
 * @returns {number} The count of unique characters (1, 2, or 3).
 */
const countUniqueCharacters = (charOne, charTwo, charThree) => {
  // A Set automatically stores only unique values.
  const characterSet = new Set();
  characterSet.add(charOne);
  characterSet.add(charTwo);
  characterSet.add(charThree);
  return characterSet.size;
};

// Iterate through each corresponding position in the character sequences.
// The loop runs for the `expectedSequenceLength` to ensure consistent processing.
for (let currentPos = 0; currentPos < expectedSequenceLength; ++currentPos) {
  // Retrieve the characters at the current position from each sequence.
  const charFromAlpha = sequenceAlpha[currentPos];
  const charFromBeta = sequenceBeta[currentPos];
  const charFromGamma = sequenceGamma[currentPos];

  // Calculate how many of these three characters are unique.
  const distinctCharCount = countUniqueCharacters(charFromAlpha, charFromBeta, charFromGamma);

  // Apply scoring rules based on the number of unique characters.
  // This switch statement clearly defines the logic for each distinctness scenario.
  switch (distinctCharCount) {
    case 3: // All three characters are different (e.g., 'A', 'B', 'C')
      totalModificationScore += 2;
      break;
    case 2: // Exactly two characters are unique (e.g., 'A', 'A', 'B' or 'A', 'B', 'A')
      totalModificationScore += 1;
      break;
    case 1: // All three characters are identical (e.g., 'A', 'A', 'A')
      // No operations needed, score remains unchanged (effectively adds 0).
      break;
    default:
      // This case should ideally not be reached with valid character inputs.
      // It serves as a safeguard for unexpected scenarios.
      console.warn(`An unexpected distinct character count (${distinctCharCount}) was observed at position ${currentPos}.`);
  }
}

// --- Output Result ---

// Output the final calculated total modification score to the standard output.
// `process.stdout.write` is used for direct stream output, explicitly adding a newline.
process.stdout.write(totalModificationScore.toString() + LINE_BREAK_CHAR);