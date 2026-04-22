// This JavaScript code analyzes a sequence of numeric values from standard input
// to identify and count specific local patterns.
// It determines how many values in the sequence act as a "peak" or a "valley"
// relative to their immediate preceding and succeeding neighbors.

function processInputSequence(rawInputContent) {
  // Verify that the input content is a valid string and not empty.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.error("Error: Provided input content is invalid or empty.");
    return;
  }

  // Split the entire input by newlines to access individual lines.
  const allInputLines = rawInputContent.split('\n');

  // The problem statement implies the data sequence is on the second line (index 1).
  // Check if a second line exists.
  const DATA_LINE_INDEX = 1;
  if (allInputLines.length <= DATA_LINE_INDEX) {
    console.log(0); // No data line found, so no patterns can exist.
    return;
  }

  // Extract the string containing the space-separated numbers.
  const numericStringData = allInputLines[DATA_LINE_INDEX].trim();

  // If the data line itself is empty after trimming, there are no numbers to process.
  if (numericStringData.length === 0) {
    console.log(0);
    return;
  }

  // Convert the string of numbers into an array of actual numeric types.
  // Filter out any empty strings that might result from multiple spaces between numbers.
  const dataValueArray = numericStringData.split(' ').filter(s => s !== '').map(Number);

  let detectedPatternCount = 0; // Initialize a counter for the identified patterns.

  // A local peak or valley requires at least three elements (previous, current, next).
  const MINIMUM_RELEVANT_LENGTH = 3;
  if (dataValueArray.length < MINIMUM_RELEVANT_LENGTH) {
    console.log(detectedPatternCount); // Will be 0 if array is too short.
    return;
  }

  let indexForComparison = 1; // Start from the second element, as the first cannot be a middle point.

  // Iterate through the array, focusing on elements that have both a predecessor and a successor.
  // The loop runs until the second-to-last element, as the last cannot be a middle point.
  while (indexForComparison < dataValueArray.length - 1) {
    // Assign values to descriptive variables for improved readability.
    const precedingValue = dataValueArray[indexForComparison - 1];
    const currentCentralValue = dataValueArray[indexForComparison];
    const succeedingValue = dataValueArray[indexForComparison + 1];

    // Ensure all three values involved in the comparison are valid numbers.
    // If any is NaN (e.g., from non-numeric input), it cannot form a valid pattern.
    if (isNaN(precedingValue) || isNaN(currentCentralValue) || isNaN(succeedingValue)) {
      indexForComparison++; // Move to the next element if current triplet is invalid.
      continue;
    }

    // Check if the current value forms an ascending sequence (valley).
    const isAscendingPattern = (precedingValue < currentCentralValue) && (currentCentralValue < succeedingValue);
    // Check if the current value forms a descending sequence (peak).
    const isDescendingPattern = (precedingValue > currentCentralValue) && (currentCentralValue > succeedingValue);

    // If either an ascending or descending pattern is detected, increment the count.
    if (isAscendingPattern || isDescendingPattern) {
      detectedPatternCount++;
    }

    // Progress to the next element in the sequence.
    indexForComparison++;
  }

  // Output the final tally of detected patterns.
  console.log(detectedPatternCount);
}

// --- Main Execution Logic ---
// This block handles reading input from stdin and invoking the analysis function.
try {
  // Utilize Node.js's 'node:fs' module to synchronously read the input file.
  const inputFileContents = require('node:fs').readFileSync('/dev/stdin', 'utf8');
  processInputSequence(inputFileContents);
} catch (fileSystemError) {
  // Provide specific error messages based on the type of file system error.
  if (fileSystemError.code === 'ENOENT') {
    console.error("Error: Standard input file '/dev/stdin' not found. Please ensure input is piped or redirected.");
  } else {
    console.error("An unforeseen error occurred during input file processing:", fileSystemError.message);
  }
}