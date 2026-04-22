// This module is designed to determine the length of the overlapping section
// between two numerical intervals provided as a string.
// It expects four space-separated integer values representing [start1, end1, start2, end2].
function CalculateSegmentOverlap(rawIntervalData) {
  // Normalize the input string by trimming whitespace and splitting by one or more spaces.
  const intervalTokens = rawIntervalData.trim().split(/\s+/);

  // --- Input integrity checks and type conversion (Type III additions) ---

  // Define the expected number of numerical components.
  const NUMERIC_COMPONENTS_EXPECTED = 4;
  if (intervalTokens.length < NUMERIC_COMPONENTS_EXPECTED) {
    // Output an error message for insufficient data.
    process.stderr.write(`ERROR: Not enough data points. ${NUMERIC_COMPONENTS_EXPECTED} required, ${intervalTokens.length} received.\n`);
    return; // Terminate processing for invalid input.
  }

  // Parse the string tokens into numeric values.
  // The unary plus operator (+) is used for concise string-to-number conversion.
  const [
    firstIntervalBegin,  // Represents the start point of the initial range.
    firstIntervalEnd,    // Represents the end point of the initial range.
    secondIntervalBegin, // Represents the start point of the subsequent range.
    secondIntervalEnd    // Represents the end point of the subsequent range.
  ] = intervalTokens.map(val => +val); // Type II: data type change, Type III: array destructuring with map

  // Validate that all parsed components are indeed valid numbers.
  const areAllValidNumbers = [
    firstIntervalBegin,
    firstIntervalEnd,
    secondIntervalBegin,
    secondIntervalEnd
  ].every(num => typeof num === 'number' && !isNaN(num)); // Type III: explicit validation

  if (!areAllValidNumbers) {
    process.stderr.write("ERROR: One or more input values are not valid numerical representations.\n");
    return; // Terminate processing.
  }

  // --- Logic for identifying non-overlapping scenarios (Type III Refactoring) ---

  // Determine if the two intervals do not intersect.
  // Case 1: The first interval ends before or exactly when the second one begins.
  // Case 2: The second interval ends before or exactly when the first one begins.
  const isNonOverlapping =
    firstIntervalEnd <= secondIntervalBegin || secondIntervalEnd <= firstIntervalBegin;

  if (isNonOverlapping) {
    // If no overlap is detected, the length of the intersection is zero.
    process.stdout.write("0\n"); // Type II: Change output mechanism.
    return; // Exit early as the result is determined.
  }

  // --- Calculation of the overlapping segment (Type III Rewriting) ---

  // If an overlap exists, calculate its precise boundaries.
  // The start of the overlapping segment is the greater of the two interval start points.
  const intersectionStartPoint = Math.max(firstIntervalBegin, secondIntervalBegin); // Type III: Replaced conditional with Math.max

  // The end of the overlapping segment is the lesser of the two interval end points.
  const intersectionEndPoint = Math.min(firstIntervalEnd, secondIntervalEnd);     // Type III: Replaced conditional with Math.min

  // Calculate the length of the common segment.
  // Ensure the length is non-negative, though 'isNonOverlapping' check should prevent negative outcomes.
  const calculatedOverlapExtent = Math.max(0, intersectionEndPoint - intersectionStartPoint); // Type III: Added a redundant guard

  // Output the final computed length of the intersection.
  process.stdout.write(`${calculatedOverlapExtent}\n`); // Type II: Use template literal for output.
}

// --- Program Execution Control (Type III additions/restructuring) ---

// Constant for the standard input file path, common in competitive programming.
const STANDARD_INPUT_FILE = "/dev/stdin";

/**
 * Utility function to securely read raw text data from the standard input file.
 * @returns {string} The content read from stdin, or an empty string on error.
 */
const retrieveStandardInputData = () => { // Type III: Encapsulated input reading in a helper arrow function
  try {
    // Dynamically require the 'fs' module for file system operations.
    const fileSystemHandler = require("fs");
    // Read the file synchronously, specifying UTF-8 encoding.
    return fileSystemHandler.readFileSync(STANDARD_INPUT_FILE, "utf8");
  } catch (dataReadError) {
    // Log any errors encountered during file reading to standard error.
    process.stderr.write(`ERROR: Could not read data from ${STANDARD_INPUT_FILE}. Details: ${dataReadError.message}\n`);
    return ""; // Return an empty string to indicate failure.
  }
};

// Main execution block:
// 1. Fetch the input string.
const programInputString = retrieveStandardInputData();

// 2. Process the input string if it's not empty.
if (programInputString.length > 0) { // Type III: Guard clause for empty input
  CalculateSegmentOverlap(programInputString);
} else {
  process.stderr.write("WARNING: No input data was provided for interval overlap calculation.\n");
}