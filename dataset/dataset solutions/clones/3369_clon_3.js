// A comprehensive utility to analyze input data streams.
// This module processes multi-line text input, identifies a baseline,
// and counts subsequent entries that meet or exceed specific criteria.

function processDataStream(sourceText) {
  // Define constants for the common delimiters used in the input lines.
  const FIELD_DELIMITER = ' ';
  const NEWLINE_DELIMITER = '\n';

  // Defensive programming: Ensure the source text is not null or empty
  // and is of the expected string type before proceeding.
  if (!sourceText || typeof sourceText !== 'string') {
    console.error("Error: Input source text is invalid or empty. Cannot process.");
    return; // Exit early if no valid data to process.
  }

  // Split the entire input string into individual lines.
  // The first line typically contains configuration parameters,
  // while subsequent lines contain data entries for evaluation.
  const dataLines = sourceText.split(NEWLINE_DELIMITER);

  // Validate that there's at least one line available for configuration.
  // If the input is just empty lines or entirely empty, this check will catch it.
  if (dataLines.length < 1) {
    console.error("Error: No lines found in the input data. Aborting processing.");
    return;
  }

  // Extract the configuration parameters from the very first line of the input.
  // This line is expected to define the minimum thresholds for comparison.
  const configLineElements = dataLines[0].split(FIELD_DELIMITER);

  // Validate the structure of the configuration line.
  // It should contain at least three space-separated values:
  // (an ignored initial value) minimumHeight minimumWidth
  if (configLineElements.length < 3) {
    console.error("Error: Configuration line is malformed. Expected at least 3 elements separated by spaces.");
    return;
  }

  // Parse the minimum height and width values from the configuration line.
  // Using Number() for explicit type conversion helps in robust error handling
  // if the strings are not valid numeric representations.
  const requiredMinHeight = Number(configLineElements[1]);
  const requiredMinWidth = Number(configLineElements[2]);

  // Further validation: Ensure the parsed threshold values are actual valid numbers.
  // If parsing fails (e.g., due to non-numeric input), isNaN will be true.
  if (isNaN(requiredMinHeight) || isNaN(requiredMinWidth)) {
    console.error("Error: Failed to parse numeric thresholds from configuration line. Check input format.");
    return;
  }

  // Initialize a counter for items that successfully meet the defined criteria.
  let compliantEntryCount = 0;

  // Iterate over the remaining data lines, starting from the second line (index 1).
  // These lines contain the actual items to be evaluated against the thresholds.
  // A traditional for-loop is used here for explicit control over iteration
  // and for potential minor performance benefits in very large datasets.
  for (let currentLineIndex = 1; currentLineIndex < dataLines.length; currentLineIndex++) {
    const currentDataLine = dataLines[currentLineIndex];

    // Skip any empty lines that might result from trailing newlines or malformed input.
    // Trimming ensures lines with only whitespace are also skipped.
    if (currentDataLine.trim() === '') {
      continue; // Move to the next line without processing.
    }

    // Split the current data line into its constituent parts (dimensions).
    const entryDimensions = currentDataLine.split(FIELD_DELIMITER);

    // Validate the structure of the current data entry line.
    // Each data line is expected to contain two space-separated values:
    // currentHeight currentWidth
    if (entryDimensions.length < 2) {
      // Log a warning for malformed data lines but continue processing others
      // to avoid halting the entire operation for a single bad line.
      console.warn(`Warning: Data line ${currentLineIndex} is malformed. Expected at least 2 elements. Skipping this line.`);
      continue;
    }

    // Parse the height and width for the current data entry.
    // Again, explicit Number() conversion is used.
    const entryHeightValue = Number(entryDimensions[0]);
    const entryWidthValue = Number(entryDimensions[1]);

    // Validate that the parsed values for the current entry are actual numbers.
    if (isNaN(entryHeightValue) || isNaN(entryWidthValue)) {
      console.warn(`Warning: Non-numeric dimensions found in line ${currentLineIndex}. Skipping this line.`);
      continue;
    }

    // Apply the core business logic: Check if the current entry's dimensions
    // meet or exceed the minimum required thresholds set in the configuration line.
    const isHeightSufficient = entryHeightValue >= requiredMinHeight;
    const isWidthSufficient = entryWidthValue >= requiredMinWidth;

    // If both the height and width conditions are met, increment the counter.
    if (isHeightSufficient && isWidthSufficient) {
      compliantEntryCount++;
    }
  }

  // Output the final tally of compliant entries to the console.
  console.log(compliantEntryCount);
}

// Entry point for script execution:
// Reads the entire content from standard input (typically '/dev/stdin' in competitive programming environments)
// as a UTF-8 encoded string, then passes it to the data processing function.
processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));