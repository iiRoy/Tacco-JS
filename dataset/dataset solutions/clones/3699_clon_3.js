'use strict';

// Function responsible for orchestrating the data processing pipeline.
function processDataStream(rawData) {

  // --- Input Validation and Preprocessing ---
  // Ensure the raw input data is a valid non-empty string.
  if (typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input data is either missing or not in a valid string format.");
    return; // Terminate execution for invalid input
  }

  // Divide the complete raw input into an array of separate lines.
  const allInputLines = rawData.split('\n');

  // Verify that there are enough lines to extract the numeric sequence.
  // The original problem structure implies at least two lines (N and then the numbers).
  const minimumRequiredLines = 2;
  if (allInputLines.length < minimumRequiredLines) {
    console.error(`Error: Insufficient input lines. At least ${minimumRequiredLines} lines were expected.`);
    return;
  }

  // The first line typically contains a count (N) which is not directly utilized
  // in the core logic of finding the difference between max and min.
  // Therefore, we explicitly omit processing or storing it here, demonstrating a deletion.
  // const initialCount = parseInt(allInputLines[0].trim(), 10); // This line is intentionally removed.

  // Extract the second line, which holds the space-separated numeric values.
  const numericalStringSegment = allInputLines[1];

  // Validate the extracted segment to ensure it's not empty.
  if (!numericalStringSegment || numericalStringSegment.trim().length === 0) {
    console.error("Error: The second line, intended for numeric values, is empty.");
    return;
  }

  // --- Numeric Sequence Parsing and Filtering ---
  // Convert the string of numbers into an array of floating-point numbers.
  // Includes robust handling for non-numeric entries.
  const cleanedNumericSequence = numericalStringSegment
    .split(' ') // Split by space
    .map(elementText => {
      const numericAttempt = parseFloat(elementText); // Use parseFloat as a variant of Number()
      // If parsing fails, log a warning and return a marker (null) for filtering.
      if (isNaN(numericAttempt)) {
        console.warn(`Warning: Found non-numeric entry '${elementText}'. This value will be excluded.`);
        return null;
      }
      return numericAttempt;
    })
    .filter(value => value !== null); // Remove all non-numeric (null) entries

  // After parsing and cleaning, check if any valid numbers remain.
  if (cleanedNumericSequence.length === 0) {
    console.error("Error: No valid numeric values could be extracted from the input sequence.");
    return;
  }

  // --- Finding Extremal Values ---
  let highestValueFound = -Infinity; // Initialize with the smallest possible number
  let lowestValueFound = Infinity;   // Initialize with the largest possible number

  // Store array length for loop performance (a minor intermediate step).
  const currentSequenceSize = cleanedNumericSequence.length;

  // Manually iterate through the array to determine the maximum and minimum values.
  // This is a structural rewrite from using Math.max.apply and Math.min.apply.
  for (let idx = 0; idx < currentSequenceSize; idx++) {
    const currentValue = cleanedNumericSequence[idx];

    // Update highest value if current value is greater
    if (currentValue > highestValueFound) {
      highestValueFound = currentValue;
    }

    // Update lowest value if current value is smaller
    if (currentValue < lowestValueFound) {
      lowestValueFound = currentValue;
    }
  }

  // --- Result Calculation and Output ---
  // Compute the difference between the highest and lowest values.
  const calculatedDifference = highestValueFound - lowestValueFound;

  // Present the final result in a descriptive format.
  console.log(`The total spread (maximum value minus minimum value) is: ${calculatedDifference}`);
}

// --- Application Entry Point ---
// Utilize the Node.js file system module to read standard input.
const systemFileAccessor = require("fs");
const standardInputPath = "/dev/stdin"; // Universal path for standard input

try {
  // Read the entire content from standard input, ensuring UTF-8 encoding,
  // and remove any leading/trailing whitespace.
  const rawContentFromStdin = systemFileAccessor.readFileSync(standardInputPath, "utf8").trim();

  // Invoke the main processing function with the obtained content.
  processDataStream(rawContentFromStdin);

} catch (ioError) {
  // Implement robust error handling for file system operations.
  console.error(`An I/O error occurred while attempting to read from ${standardInputPath}:`, ioError.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
}