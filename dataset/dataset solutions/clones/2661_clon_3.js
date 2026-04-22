function processInputData(rawDataString) {
  // This function orchestrates the initial input processing and delegates analysis.

  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Error: Provided input data is empty or malformed.");
    return; // Exit early for invalid input
  }

  // Divide the raw string into an array of individual text segments using the newline character code.
  let dataSegments = rawDataString.split(String.fromCharCode(10));

  // If the last segment is empty (common with trailing newlines), remove it.
  if (dataSegments.length > 0 && dataSegments[dataSegments.length - 1] === '') {
    dataSegments.splice(dataSegments.length - 1, 1); // Equivalent to pop()
  }

  // The first line often contains a numerical indicator 'n', which is not used in subsequent logic.
  // We extract and discard it to align with the original processing flow.
  const initialNumericalIndicator = dataSegments.shift();
  // For debugging purposes: console.log(`Discarded initial indicator: ${initialNumericalIndicator}`);

  // Hand over the cleaned-up segments to the core processing unit.
  performCategorizationAndCalculation(dataSegments);
}

function performCategorizationAndCalculation(inputSegments) {
  // This routine processes an array of text segments, categorizes them based on
  // their sorted character forms, and then computes a cumulative sum.

  if (!Array.isArray(inputSegments) || inputSegments.length === 0) {
    console.warn("Warning: No valid input segments were provided for analysis.");
    return; // No processing needed for empty or invalid arrays
  }

  // An object to store the frequency of each canonical (sorted) string form.
  const canonicalStringFrequencies = {}; // Renamed from 'parsed'

  // Iterate over each text unit in the input array using a for-of loop.
  for (const currentTextUnit of inputSegments) {
    // Convert the current string into an array of characters, sort them alphabetically,
    // and then re-join them to create a unique, canonical key.
    const sortedCharacterKey = Array.from(currentTextUnit).sort().join('');

    // Increment the counter for this canonical key. If the key doesn't exist, initialize it to 0 first.
    canonicalStringFrequencies[sortedCharacterKey] = (canonicalStringFrequencies[sortedCharacterKey] || 0) + 1;
  }

  let finalAccumulatedValue = 0; // Renamed from 'result'

  // Extract all the frequency counts from our map.
  const allCounts = Object.values(canonicalStringFrequencies);

  // Filter for counts that are greater than 1, as only these contribute to the calculation.
  const significantCounts = allCounts.filter(count => count > 1);

  // Iterate through the significant counts using a traditional for loop.
  for (let index = 0; index < significantCounts.length; index++) {
    const currentFrequencyCount = significantCounts[index];

    // Compute the factorial of the current count and divide by two, then add to the total.
    // This calculation mirrors the original's specific mathematical operation (N! / 2).
    finalAccumulatedValue += (computeFactorial(currentFrequencyCount) / 2);
  }

  // Output the final computed value to standard output.
  console.log(finalAccumulatedValue);
}

function computeFactorial(numericValue) {
  // Computes the factorial of a non-negative integer using an iterative approach.

  // Input validation: Ensure the argument is a non-negative integer.
  if (typeof numericValue !== 'number' || !Number.isInteger(numericValue) || numericValue < 0) {
    throw new TypeError("Function 'computeFactorial' requires a non-negative integer as input.");
  }

  // Base cases for factorial: 0! = 1, 1! = 1.
  if (numericValue <= 1) {
    return 1;
  }

  let runningProduct = 1; // Initialize the product accumulator.
  // Iterate from 2 up to the numericValue to calculate the factorial.
  for (let i = 2; i <= numericValue; i++) {
    runningProduct *= i;
  }
  return runningProduct;
}

// Entry point for script execution.
// Reads input from standard input, handles potential errors, and initiates processing.
const standardFileSystemOperations = require('fs');
const standardInputDevicePath = '/dev/stdin';
const textEncodingFormat = 'utf8';

try {
  // Synchronously read all contents from the standard input device.
  const inputContentsBuffer = standardFileSystemOperations.readFileSync(standardInputDevicePath, textEncodingFormat);
  // Pass the obtained string content to the main processing function.
  processInputData(inputContentsBuffer);
} catch (readingError) {
  // Catch and report any errors encountered during file reading.
  console.error(`An error occurred while attempting to read from ${standardInputDevicePath}: ${readingError.message}`);
  // Exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}