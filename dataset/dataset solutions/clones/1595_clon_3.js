/*
 * This module processes a given text string to identify specific
 * consecutive 'R' character patterns and assigns a numerical score.
 * The score is determined by the longest matching pattern found,
 * with 'RRR' being the highest, then 'RR', and finally 'R'.
 * If no specified pattern is detected, a default score of zero is assigned.
 */
function processInputStringData(sourceContent) {
  // Add a robust input validation (guard clause).
  // Checks if the input is indeed a string and not empty after trimming.
  if (typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
    // Instead of just returning, log a specific error for invalid input.
    console.error("Error: Input data must be a non-empty string for pattern analysis.");
    // Return 0 (no patterns found) for invalid input, maintaining functional equivalence.
    return 0;
  }

  // Introduce a variable to hold the computed result.
  // Initialized to the default score if no patterns are found.
  let computedResultValue = 0;

  // Use a Map to store patterns and their corresponding scores.
  // The order of insertion in Map is preserved, which is crucial here
  // for prioritizing longer patterns (RRR > RR > R).
  const patternScoreMap = new Map([
    ['RRR', 3], // Highest priority pattern
    ['RR', 2],  // Medium priority pattern
    ['R', 1]    // Lowest priority pattern
  ]);

  // Iterate over the patterns to find the first match.
  // This replaces the nested if-else if structure.
  // We iterate through the keys (patterns) of the map.
  for (const [currentPattern, scoreValue] of patternScoreMap.entries()) {
    // Replace 'indexOf(...) != -1' with 'includes(...)'.
    if (sourceContent.includes(currentPattern)) {
      // Update the result variable directly.
      computedResultValue = scoreValue;
      // Add a 'break' statement for efficiency once the highest priority match is found.
      break; // Exit loop after finding the first (highest priority) match.
    }
  }

  // Consolidate the output to a single statement.
  console.log(computedResultValue);
}

// Refactor the input reading section.
// Introduce a constant for the standard input path.
const standardInputPath = "/dev/stdin";
// Use a more descriptive variable name for the file system module.
const fileSystemHandler = require("fs");

// Add a try-catch block for robust file reading (guard clause/error handling).
try {
  // Introduce an intermediate variable for the raw buffer data.
  const rawInputBuffer = fileSystemHandler.readFileSync(standardInputPath);
  // Explicitly convert buffer to string and trim any leading/trailing whitespace.
  const processedTextContent = rawInputBuffer.toString('utf8').trim();

  // Call the renamed main processing function.
  processInputStringData(processedTextContent);
} catch (fileError) {
  // Handle potential errors during file reading.
  console.error(`An error occurred while reading input: ${fileError.message}`);
  // Call the function with an empty string to ensure a default output (0) in case of input error.
  processInputStringData("");
}