// This function calculates the number of positions where two character sequences differ.
// It takes raw multiline string input, parses it into two character arrays,
// and then counts the character mismatches between them.
const processStringDifferences = (rawDataInput) => {
  // Defensive check for input existence and type.
  // This guard clause is an added fragment for robustness.
  if (!rawDataInput || typeof rawDataInput !== 'string') {
    console.error("Error: Invalid input provided to processStringDifferences. Expected a string.");
    return -1; // Indicate an error state for mismatch count.
  }

  // Step 1: Prepare the raw string data.
  // First, remove any leading or trailing whitespace from the entire input string.
  const trimmedInputContent = rawDataInput.trim();

  // Step 2: Split the trimmed content into individual lines.
  // We expect exactly two lines for the two character sequences.
  const inputLinesArray = trimmedInputContent.split("\n");

  // Step 3: Validate the number of lines.
  // Ensure we have at least two lines to compare. This is an added validation.
  if (inputLinesArray.length < 2) {
    console.error("Error: Insufficient lines in input. Expected at least two lines for comparison.");
    return -1; // Error state.
  }

  // Step 4: Convert each line into an array of characters.
  // The first line becomes the source character sequence.
  // Using Array.from is an alternative to the spread operator.
  const sourceCharacterSequence = Array.from(inputLinesArray[0]);

  // The second line becomes the target character sequence.
  // Using the spread operator for conversion.
  const targetCharacterSequence = [...inputLinesArray[1]];

  // Step 5: Determine the common length for iteration.
  // The problem context implies both strings will have the same length.
  // We'll use the length of the first sequence as the primary reference.
  const commonSequenceLength = sourceCharacterSequence.length;

  // Additional check: Ensure both sequences have the same length.
  // This is an added guard clause/validation.
  if (commonSequenceLength !== targetCharacterSequence.length) {
      console.warn("Warning: Source and target sequences have different lengths. Comparison will proceed up to the length of the first sequence.");
  }

  // Step 6: Initialize a counter for differences.
  // This variable will accumulate the total number of mismatches.
  let totalMismatchCount = 0;

  // Step 7: Iterate through the character sequences to find differences.
  // A standard 'for' loop is used for controlled iteration.
  // The increment step is explicitly written out.
  for (let currentPosition = 0; currentPosition < commonSequenceLength; currentPosition = currentPosition + 1) {
    // Retrieve characters at the current position from both sequences.
    // These are intermediate variables, adding steps to the original logic.
    const charFromSource = sourceCharacterSequence[currentPosition];
    const charFromTarget = targetCharacterSequence[currentPosition];

    // Compare the characters. If they are not identical, increment the mismatch counter.
    // Using an explicit boolean check for clarity.
    const areCharactersDifferent = (charFromSource !== charFromTarget);

    if (areCharactersDifferent) {
      totalMismatchCount = totalMismatchCount + 1; // Increment the counter explicitly.
    }
  }

  // Step 8: Return the final count of differing characters.
  return totalMismatchCount;
};

// --- Execution Block ---
// This section handles reading input from standard input and invoking the main processing function.

// Define constants for file system operations.
// Renamed 'fs' to 'fileSystemOperations' for Type II change.
const fileSystemOperations = require('fs');

// Define the path to the standard input device.
const standardInputFilePath = '/dev/stdin';

// Variable to hold the raw content read from the input.
// Initialized to an empty string.
let rawInputContentFromFile = '';

try {
  // Attempt to read the content of the standard input file synchronously.
  // The 'utf8' encoding is specified to handle text data correctly.
  rawInputContentFromFile = fileSystemOperations.readFileSync(standardInputFilePath, 'utf8');
} catch (readOperationError) {
  // If an error occurs during file reading (e.g., file not found, permission denied),
  // log the error and handle gracefully. This try-catch block is an added fragment.
  console.error(`An error occurred while attempting to read from ${standardInputFilePath}:`, readOperationError.message);
  // Set content to empty string so the main function can handle it gracefully via its own guard clauses.
  rawInputContentFromFile = '';
}

// Call the primary function with the obtained input and store the result.
// The result represents the total number of character differences.
const finalDifferenceCount = processStringDifferences(rawInputContentFromFile);

// Display the computed difference count to the console.
console.log(finalDifferenceCount);