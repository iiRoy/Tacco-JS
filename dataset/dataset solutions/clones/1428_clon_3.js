function analyzeTextCharacterFrequencies(sourceContent) {
  // Validate the input content to ensure it's a non-empty string.
  if (typeof sourceContent !== 'string' || sourceContent.length === 0) {
    console.error("Error: Input content must be a non-empty string for analysis.");
    return; // Exit the function if input is invalid.
  }

  // Process the raw input: split into lines, trim whitespace from each line,
  // and filter out any lines that become empty after trimming.
  const inputLinesArray = sourceContent.split('\n')
                                      .map(lineSegment => lineSegment.trim())
                                      .filter(trimmedSegment => trimmedSegment.length > 0);

  // Initialize a Map to store character frequencies.
  // Using a Map provides clear key-value pair storage.
  const characterOccurrencesMap = new Map();

  // Log the start of the analysis process.
  console.log("Initiating character frequency analysis across provided text...");

  // Iterate over each valid line segment obtained from the input.
  for (const currentTextLine of inputLinesArray) {
    // Process each character within the current line.
    for (let charPositionInLine = 0; charPositionInLine < currentTextLine.length; ++charPositionInLine) {
      const originalCharacter = currentTextLine[charPositionInLine];
      const normalizedCharacter = originalCharacter.toLowerCase(); // Convert to lowercase for case-insensitive counting.

      // Increment the count for the normalized character.
      // If the character is encountered for the first time, initialize its count to 1.
      const existingCount = characterOccurrencesMap.get(normalizedCharacter) || 0;
      characterOccurrencesMap.set(normalizedCharacter, existingCount + 1);
    }
  }

  // Analysis phase completed. Prepare to display the results for the alphabet.
  console.log("Analysis complete. Presenting frequency report for English alphabet:");

  // Define the character codes for 'a' and 'z' to iterate through the alphabet.
  const asciiCodeForA = 'a'.charCodeAt(0);
  const asciiCodeForZ = 'z'.charCodeAt(0);

  // Iterate from 'a' to 'z' using their ASCII character codes.
  for (let currentCharCode = asciiCodeForA; currentCharCode <= asciiCodeForZ; ++currentCharCode) {
    const alphabeticalCharacter = String.fromCharCode(currentCharCode);
    // Retrieve the count for the current alphabetical character, defaulting to 0 if not found.
    const finalCharacterCount = characterOccurrencesMap.get(alphabeticalCharacter) || 0;

    // Construct and log the output string for each character.
    const formattedOutput = `${alphabeticalCharacter} : ${finalCharacterCount}`;
    console.log(formattedOutput);
  }

  // Concluding message for the report.
  console.log("--- End of Frequency Report ---");
}

// Main execution block: Read input from standard input and pass to the analyzer.
// A try-catch block is added for robust error handling during file reading.
try {
  const contentFromStandardInput = require("node:fs").readFileSync("/dev/stdin", "utf8");
  analyzeTextCharacterFrequencies(contentFromStandardInput);
} catch (fileSystemError) {
  // If there's an issue reading the file, log the error.
  console.error("Failed to acquire input from /dev/stdin:", fileSystemError.message);
  // In a production environment, one might also exit the process here: process.exit(1);
}