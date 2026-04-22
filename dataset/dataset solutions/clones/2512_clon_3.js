function processInputData(initialRawInput) {
  // Declare variables using modern JavaScript keywords for better scope management
  let processedLines;
  let characterSequence;
  let repetitionFactor;
  let totalHomogeneousPairs = 0; // Renamed 'Count' to a more descriptive name

  // --- Input Validation and Pre-processing (Added Guard Clauses) ---

  // Verify that the input data is not empty or just whitespace
  if (!initialRawInput || initialRawInput.trim() === "") {
    console.error("Input data is empty or invalid. Please provide a string with at least two lines.");
    return; // Exit if input is invalid
  }

  // Split the raw input string by newline characters to get individual lines
  processedLines = initialRawInput.split("\n");

  // Ensure there are at least two lines: one for the character sequence and one for the repetition factor
  if (processedLines.length < 2) {
    console.error("Insufficient input lines provided. Expected at least two lines.");
    return; // Exit if not enough lines
  }

  // Extract the character sequence from the first line and convert it to an array of characters
  characterSequence = processedLines[0].split(""); // Renamed 'S' to 'characterSequence'

  // Parse the repetition factor from the second line, ensuring it's an integer
  repetitionFactor = parseInt(processedLines[1], 10); // Renamed 'K' to 'repetitionFactor', added parseInt

  // Validate the parsed repetition factor
  if (isNaN(repetitionFactor) || repetitionFactor < 0) {
    console.error("Repetition factor must be a valid non-negative number.");
    return; // Exit if repetitionFactor is invalid
  }

  // Store the length of the character sequence for efficiency and readability
  const sequenceLength = characterSequence.length;

  // Handle the edge case where the character sequence itself is empty
  if (sequenceLength === 0) {
    console.log(0); // No pairs can be formed from an empty sequence
    return;
  }

  // --- Core Logic: Counting Homogeneous Pairs ---

  // Helper function to count consecutive identical characters within a given sequence
  // This extracts a part of the original loop into a reusable function
  const countInternalConsecutivePairs = (sequence) => {
    let currentPairCount = 0;
    // Iterate through the sequence, comparing each character with its successor
    // The loop runs up to 'length - 1' to prevent accessing an out-of-bounds index for 'sequence[currentIdx + 1]'
    for (let currentIdx = 0; currentIdx < sequence.length - 1; currentIdx++) {
      if (sequence[currentIdx] === sequence[currentIdx + 1]) {
        currentPairCount++;
      }
    }
    return currentPairCount;
  };

  // Calculate the number of homogeneous pairs within a single instance of the character sequence
  totalHomogeneousPairs = countInternalConsecutivePairs(characterSequence);

  // Multiply this initial count by the number of times the sequence is repeated
  totalHomogeneousPairs *= repetitionFactor;

  // --- Type III Modification: Addressing a potential logic flaw and adding clarity ---
  // The original code had `if(S[0] == S[S.length])`.
  // In JavaScript, `S[S.length]` accesses an element beyond the array's bounds, resulting in `undefined`.
  // A character (S[0]) will almost never equal `undefined`.
  // This condition is typically intended to check if the *first* and *last* characters
  // of the original string are identical. If they are, repeating the string creates
  // additional homogeneous pairs at the "join points" between repetitions.
  // We are correcting this to `characterSequence[sequenceLength - 1]` to reflect the likely intent.

  let formsJoinBridge = false; // Using a descriptive boolean flag
  // Check if the first and last characters of the sequence are identical
  // This check is only meaningful for sequences with more than one character
  if (sequenceLength > 1 && characterSequence[0] === characterSequence[sequenceLength - 1]) {
    formsJoinBridge = true;
  }

  if (formsJoinBridge) {
    // If the first and last characters match, each time the string is concatenated,
    // a new homogeneous pair is formed at the boundary.
    // For 'repetitionFactor' repetitions, there are 'repetitionFactor - 1' such boundaries.
    totalHomogeneousPairs += (repetitionFactor - 1);
  }
  // --- End of Type III Modification ---

  // Output the final calculated total of homogeneous pairs
  console.log(totalHomogeneousPairs);
}

// --- Execution Entry Point ---

// Use 'const' for module imports for better practice
const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const defaultEncoding = "utf8";

// Implement robust error handling for file reading
try {
  const inputContentFromFile = fileSystemModule.readFileSync(standardInputFilePath, defaultEncoding);
  // Call the main processing function with the content read from standard input
  processInputData(inputContentFromFile);
} catch (readError) {
  // Log any errors encountered during file reading
  console.error(`An error occurred while reading from ${standardInputFilePath}: ${readError.message}`);
}