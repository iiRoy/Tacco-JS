// Function to analyze a given text for specific patterns.
// This utility processes multi-line input to extract configuration and data,
// then counts occurrences of a predefined substring.
function analyzeTextForPattern(rawInputText) {
  // Robustness check: Ensure the input is a valid string.
  // If not, log an error and exit gracefully, indicating no patterns found.
  if (typeof rawInputText !== 'string' || rawInputText === null) {
    console.error("Input data type error: Expected a string for processing.");
    console.log(0); // Output a default count of zero for invalid input.
    return;
  }

  // Define the constant pattern string we are searching for.
  const TARGET_SUBSTRING_SEQUENCE = 'ABC';
  // Pre-calculate the length of the target pattern for efficiency in loop conditions.
  const SEQUENCE_LENGTH_TO_MATCH = TARGET_SUBSTRING_SEQUENCE.length;

  // Pre-process the raw input:
  // 1. Trim any leading/trailing whitespace (including newlines) from the entire input.
  // 2. Split the cleaned input into an array of lines based on newline characters.
  const processedInputLines = rawInputText.trim().split('\n');

  // Initial validation: Check if there are at least two lines available.
  // The first line is typically for configuration (e.g., expected length),
  // and the second line contains the actual data string.
  if (processedInputLines.length < 2) {
    console.log(0); // If insufficient lines, no patterns can be found.
    return;
  }

  // Parse the first line to extract a numerical value.
  // This value might represent an expected length or another parameter.
  // Using parseInt with a radix for explicit base-10 conversion.
  const configurationValue = parseInt(processedInputLines[0], 10);

  // Validate the parsed configuration value. If it's not a valid non-negative number,
  // it suggests malformed input. We log an error and treat it as zero occurrences.
  if (isNaN(configurationValue) || configurationValue < 0) {
      console.error("Configuration value from input line 1 is invalid or negative.");
      console.log(0); // Default to zero occurrences in case of bad configuration.
      return;
  }

  // Extract the main data string from the second line of the input.
  const primaryDataString = processedInputLines[1];

  // Initialize a counter to keep track of how many times the target pattern is found.
  let matchingPatternCount = 0;

  // Iterate through the primary data string to find all occurrences of the target pattern.
  // The loop condition ensures that we always have enough characters remaining
  // in `primaryDataString` to form a substring of `SEQUENCE_LENGTH_TO_MATCH` length.
  for (let charIndex = 0; charIndex <= primaryDataString.length - SEQUENCE_LENGTH_TO_MATCH; charIndex++) {
    // Extract a segment (slice) of the `primaryDataString` starting from `charIndex`.
    // The length of this segment is equal to the length of our `TARGET_SUBSTRING_SEQUENCE`.
    const currentSegment = primaryDataString.slice(charIndex, charIndex + SEQUENCE_LENGTH_TO_MATCH);

    // Compare the extracted segment with our predefined target pattern.
    if (currentSegment === TARGET_SUBSTRING_SEQUENCE) {
      // If a match is found, increment the occurrence counter.
      matchingPatternCount++;
    }
  }

  // Output the total number of times the target pattern was found.
  console.log(matchingPatternCount);
}

// Standard entry point for executing the script in a Node.js environment.
// It reads input from `/dev/stdin` (standard input).
try {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to our main analysis function.
    analyzeTextForPattern(inputContent);
} catch (processingError) {
    // Catch any errors that occur during file reading or initial processing.
    console.error("An error occurred during input acquisition or initial processing:", processingError.message);
    // In case of a critical error, output 0 to indicate no successful processing.
    console.log(0);
}