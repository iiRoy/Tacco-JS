// This module defines a specialized routine for processing numerical data from a text input source.
// It aims to identify and calculate a specific difference between elements within a sorted sequence.
const executeSolution = (rawInputText) => {
  // === Stage 1: Input Validation and Initial Cleaning ===
  // A crucial first step is to ensure the input is a valid string and not empty.
  // This guards against potential runtime errors with subsequent string operations.
  if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
    console.error("Critical Error: The provided input data is either not a string or is empty. Cannot proceed.");
    // An immediate return prevents further processing of invalid data.
    return;
  }

  // Standardize the input string by removing any extraneous whitespace
  // from both the beginning and the end. This ensures consistent parsing.
  const cleanedInputContent = rawInputText.trimStart().trimEnd();

  // If after trimming, the content is empty, it's still invalid for our purpose.
  if (cleanedInputContent.length === 0) {
    console.error("Critical Error: Input data became empty after trimming whitespace. No valid content found.");
    return;
  }

  // === Stage 2: Parsing Input into Structured Data ===
  // The input is expected to be multi-line. We split it into an array of lines.
  // The first line typically contains metadata (like an element count), and subsequent lines hold the actual data.
  const contentLines = cleanedInputContent.split('\n');

  // Verify that we have at least two lines: one for the count and one for the numeric sequence.
  if (contentLines.length < 2) {
    console.error("Parsing Error: Insufficient lines in the input. Expected at least two lines for metadata and data.");
    return;
  }

  // Extract the element count indicator from the first line.
  // This indicator is usually the first space-separated token on the first line.
  // We use Number.parseInt for explicit base-10 conversion.
  const elementCountIndicator = Number.parseInt(contentLines[0].split(' ')[0], 10);

  // Validate the parsed element count indicator.
  // It must be a positive integer to be meaningful for array indexing.
  if (Number.isNaN(elementCountIndicator) || elementCountIndicator <= 0) {
    console.error(`Parsing Error: Invalid or non-positive element count indicator found: '${contentLines[0]}'.`);
    return;
  }

  // Retrieve the second line, which contains the space-separated numerical values.
  const rawNumericDataLine = contentLines[1];

  // Split this line into an array of string-represented numbers.
  const stringRepresentedNumbers = rawNumericDataLine.split(' ');

  // Convert each string representation into an actual number.
  // We also filter out any results that are not valid numbers (e.g., from empty strings or non-numeric text).
  let sortedNumericSequence = stringRepresentedNumbers
    .map(currentStringValue => Number(currentStringValue)) // Attempt conversion to number.
    .filter(numericValue => !Number.isNaN(numericValue)); // Keep only actual numbers.

  // === Stage 3: Data Validation and Sorting ===
  // After parsing and filtering, ensure we have enough valid numbers to perform the required calculation.
  // A minimum of two elements is needed to compute a difference between two distinct points.
  if (sortedNumericSequence.length < 2) {
    console.error("Data Validation Error: Not enough valid numerical elements were parsed from the input line.");
    return;
  }

  // Sort the array of numbers in ascending order.
  // The standard JavaScript sort method with a custom comparator function `(a, b) => a - b`
  // provides efficient numerical sorting.
  sortedNumericSequence.sort((valueOne, valueTwo) => valueOne - valueTwo);

  // === Stage 4: Index Calculation and Difference Computation ===
  // Calculate the base index using the element count indicator.
  // Math.floor is explicitly used to ensure integer indices, even if the division results in a float.
  const calculatedBaseIndex = Math.floor(elementCountIndicator / 2);

  // Determine the two specific indices for which we need to find the difference.
  // These typically represent elements around the "middle" or "median" of the sequence.
  const firstTargetIndex = calculatedBaseIndex;
  const secondTargetIndex = calculatedBaseIndex + 1;

  // Crucial bounds checking: ensure the calculated indices are valid for the sorted array.
  if (firstTargetIndex < 0 || secondTargetIndex >= sortedNumericSequence.length) {
    console.error(`Index Out of Bounds Error: Calculated indices [${firstTargetIndex}, ${secondTargetIndex}] are invalid for an array of length ${sortedNumericSequence.length}.`);
    return;
  }

  // Retrieve the numerical values at the identified indices.
  const valueAtLowerBoundIndex = sortedNumericSequence[firstTargetIndex];
  const valueAtUpperBoundIndex = sortedNumericSequence[secondTargetIndex];

  // Calculate the final difference between the two selected values.
  const finalCalculatedDifference = valueAtUpperBoundIndex - valueAtLowerBoundIndex;

  // === Stage 5: Output ===
  // Print the computed difference to the console, which is the expected output.
  console.log(finalCalculatedDifference);
};

// === Execution Environment Setup ===
// This block handles the interaction with the operating system's standard input.
// It reads the entire content from /dev/stdin (common in competitive programming environments)
// and passes it to our main solution function.
try {
  // Dynamically require the 'fs' (file system) module provided by Node.js.
  const fileSystemModule = require('fs');
  // Define the standard path for input in Unix-like systems.
  const standardInputFile = '/dev/stdin';

  // Read the entire file synchronously as a UTF-8 encoded string.
  // This blocks execution until the input is fully read.
  const receivedInputContent = fileSystemModule.readFileSync(standardInputFile, 'utf8');

  // Execute the core solution logic with the gathered input.
  executeSolution(receivedInputContent);
} catch (environmentError) {
  // If any error occurs during the file reading or initial setup (e.g., file not found, permissions),
  // log it to the console for debugging.
  console.error("Runtime Environment Error: An issue occurred during input acquisition or program initialization.");
  console.error("Details:", environmentError.message);
  // Optionally, exit the process with an error code to signal failure.
  process.exit(1);
}