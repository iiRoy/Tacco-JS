const analyzeCharacterSequence = (sourceTextData) => {
  // Guard clause: Validate the raw input data.
  if (!sourceTextData || typeof sourceTextData !== 'string' || sourceTextData.trim().length === 0) {
    console.error("Input data is empty or invalid. Cannot proceed with character analysis.");
    return; // Exit the function if no valid data.
  }

  // Step 1: Process the raw string input into an array of lines.
  // The original map(v => v) was redundant, simplifying this step.
  const dataLines = sourceTextData.split('\n');

  // Guard clause: Ensure we have enough lines for the length and the sequence.
  if (dataLines.length < 2) {
    console.error("Insufficient lines in the input. Expected at least two lines (length, sequence).");
    return;
  }

  // Step 2: Extract and prepare the key parameters from the processed lines.
  // Trim whitespace from lines to ensure clean data.
  const stringLengthIndicator = dataLines[0].trim();
  const targetCharacterSequence = dataLines[1].trim();

  // Explicitly parse the length indicator to an integer.
  // This is a more robust way than relying on implicit coercion as in the original.
  const numericalLimit = parseInt(stringLengthIndicator, 10);

  // Initialize a data structure to hold our counts. Using an object is a Type III change.
  const tallyOfMarks = {
    periodsFound: 0, // Renamed 'dot'
    hashesFound: 0   // Renamed 'sharp'
  };

  // Determine the effective iteration boundary.
  // The original loop `i <= N` where N is a string could be problematic.
  // Here, we take the minimum of the parsed numerical limit and the actual string length
  // to prevent out-of-bounds access and respect both constraints.
  const actualIterationCount = Math.min(numericalLimit, targetCharacterSequence.length);

  // Step 3: Iterate through the sequence to count characters.
  // Changed loop variable name and used 'let' for block scoping.
  for (let currentPosition = 0; currentPosition < actualIterationCount; currentPosition++) {
    // Introduce a temporary variable for the character at the current position.
    const inspectedCharacter = targetCharacterSequence[currentPosition];

    // Using a switch statement instead of if/else if for stylistic variation (Type III change).
    switch (inspectedCharacter) {
      case '.':
        tallyOfMarks.periodsFound++;
        break;
      case '#':
        tallyOfMarks.hashesFound++;
        break;
      default:
        // New fragment: Handle or log unexpected characters.
        // For this problem, we'll simply ignore characters that are not '.' or '#'.
        // console.warn(`Unrecognized character '${inspectedCharacter}' at index ${currentPosition}. Skipping.`);
        break;
    }
  }

  // Step 4: Determine the minimum of the two counts.
  // Using Math.min() is a concise rewrite of the original if/else block.
  const minimumCharacteristicCount = Math.min(tallyOfMarks.periodsFound, tallyOfMarks.hashesFound);

  // Output the final result.
  console.log(minimumCharacteristicCount);

  // Optionally, return the value for testing purposes, although original only logged.
  return minimumCharacteristicCount;
};

// Main execution block: This part handles file system interaction.
// Renamed variables and added error handling (Type III change).
const fileSystemHandler = require("fs");
const inputFilePath = "/dev/stdin";
const fileEncodingScheme = "UTF-8";

try {
  // Read the content of the standard input file.
  const fileContentBuffer = fileSystemHandler.readFileSync(inputFilePath, fileEncodingScheme);
  // Pass the obtained content to our analysis function.
  analyzeCharacterSequence(fileContentBuffer);
} catch (fileReadingError) {
  // New fragment: Provide robust error handling for file operations.
  console.error(`Error encountered while reading input file: ${fileReadingError.message}`);
  // In a production environment, you might want to exit the process.
  // process.exit(1);
}