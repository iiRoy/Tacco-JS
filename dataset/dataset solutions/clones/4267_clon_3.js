const compareNumericsAscending = (valueOne, valueTwo) => valueOne - valueTwo;

/**
 * Parses a string line containing space-separated numbers,
 * converts them to numeric type, filters invalid entries,
 * and sorts them in ascending order.
 *
 * @param {string} lineContent - The string line to process.
 * @returns {number[]} An array of sorted numbers. Returns an empty array for invalid input.
 */
const parseAndSortNumericLine = (lineContent) => {
  // Guard clause for invalid or empty line content
  if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
    return [];
  }

  // Chain of operations to transform the string into a sorted numeric array:
  return lineContent
    .trim() // Remove any leading/trailing whitespace
    .split(' ') // Split the string by spaces into an array of string numbers
    .filter(strItem => strItem.length > 0) // Remove any empty strings resulting from multiple spaces
    .map(Number) // Convert each string item to its numeric equivalent
    .filter(numericItem => !isNaN(numericItem)) // Filter out any results that are Not-a-Number
    .sort(compareNumericsAscending); // Sort the numeric array in ascending order
};

/**
 * Determines if three given values form a strictly ascending triplet.
 * i.e., valA < valB < valC.
 *
 * @param {number} valA - The first value.
 * @param {number} valB - The second value.
 * @param {number} valC - The third value.
 * @returns {boolean} True if the condition is met, false otherwise.
 */
const checkAscendingTripletCondition = (valA, valB, valC) => {
  return valA < valB && valB < valC;
};

/**
 * Main execution routine to analyze the raw input data.
 * It parses three arrays of numbers, sorts them, and then counts
 * how many triplets (a, b, c) satisfy the condition a < b < c.
 *
 * @param {string} rawDataPayload - The entire input as a single string, typically from stdin.
 */
function analyzeInputData(rawDataPayload) {
  // --- Input Validation and Parsing ---

  // Initial validation of the raw input string
  if (typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
    console.error("Operation Aborted: Input payload is empty or not a valid string.");
    return;
  }

  // Split the raw payload into individual lines, trim each, and filter out any empty lines.
  const processedDataLines = rawDataPayload.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Check if we have the minimum required number of lines (N + 3 arrays)
  const minimumExpectedLines = 4;
  if (processedDataLines.length < minimumExpectedLines) {
    console.error(`Operation Aborted: Insufficient input lines provided. Expected at least ${minimumExpectedLines}, received ${processedDataLines.length}.`);
    return;
  }

  // Extract and validate the element count (N) from the first line.
  const declaredElementCountString = processedDataLines[0];
  const declaredElementCount = Number(declaredElementCountString);

  // Validate that N is a positive integer.
  if (isNaN(declaredElementCount) || !Number.isInteger(declaredElementCount) || declaredElementCount <= 0) {
    console.error(`Operation Aborted: Invalid element count '${declaredElementCountString}'. Must be a positive integer.`);
    return;
  }

  // Parse and sort the three data collections from the subsequent lines.
  // Utilizing the helper function for robust parsing and sorting.
  const upperTierNumericCollection = parseAndSortNumericLine(processedDataLines[1]);
  const middleTierNumericCollection = parseAndSortNumericLine(processedDataLines[2]);
  const lowerTierNumericCollection = parseAndSortNumericLine(processedDataLines[3]);

  // --- Data Consistency Check (Optional but good practice) ---

  // Log a warning if the actual lengths of the parsed arrays don't match the declared N.
  // The loops will use actual lengths, but this indicates potential input issues.
  if (upperTierNumericCollection.length !== declaredElementCount ||
      middleTierNumericCollection.length !== declaredElementCount ||
      lowerTierNumericCollection.length !== declaredElementCount) {
    console.warn(`Warning: One or more parsed collection lengths (${upperTierNumericCollection.length}, ${middleTierNumericCollection.length}, ${lowerTierNumericCollection.length}) do not match the declared element count N (${declaredElementCount}). Proceeding with actual lengths.`);
  }

  // --- Core Logic: Triplet Counting ---

  // Initialize a variable to accumulate the count of valid triplets.
  let successfulTripletCombinations = 0;

  // Cache array lengths for loop efficiency and clarity.
  const lengthUpper = upperTierNumericCollection.length;
  const lengthMiddle = middleTierNumericCollection.length;
  const lengthLower = lowerTierNumericCollection.length;

  // Iterate through each element of the upper tier collection.
  for (let currentUpperIdx = 0; currentUpperIdx < lengthUpper; ++currentUpperIdx) {
    const currentUpperValue = upperTierNumericCollection[currentUpperIdx];

    // Iterate through each element of the middle tier collection.
    for (let currentMiddleIdx = 0; currentMiddleIdx < lengthMiddle; ++currentMiddleIdx) {
      const currentMiddleValue = middleTierNumericCollection[currentMiddleIdx];

      // Optimization: Since both collections are sorted ascending, if the current upper value
      // is not strictly less than the current middle value, then any subsequent middle values
      // (for this `currentUpperValue`) will also not satisfy `A < B`.
      // We can `continue` to the next `currentUpperIdx` if `currentUpperValue >= currentMiddleValue`.
      // Wait, this optimization is incorrect. If `currentUpperValue >= currentMiddleValue`, it means this specific `(A, B)` pair fails.
      // But a *later* `B` might still work for this `A`.
      // The arrays are sorted, so if `currentUpperValue >= currentMiddleValue`, then no `B` *from this point onwards* will be greater than this `A`.
      // No, that's not right either.
      // If `A[i] >= B[j]`, then `A[i] < B[j]` is false. We move to `B[j+1]`.
      // This optimization is `if (currentUpperValue >= currentMiddleValue) continue;`
      // This means if `A[i]` is 5 and `B[j]` is 2, `5 >= 2` is true, so `continue` to `B[j+1]`.
      // This is indeed an optimization for the *inner* loop: if `A[i]` is already too large for `B[j]`, then there's no point in checking `C` values for this `B[j]`.
      // This `continue` is correct and acts as an early exit for the innermost loop.
      if (currentUpperValue >= currentMiddleValue) {
        continue; // Skip to the next middle tier element if the first condition (A < B) is not met.
      }

      // Iterate through each element of the lower tier collection.
      for (let currentLowerIdx = 0; currentLowerIdx < lengthLower; ++currentLowerIdx) {
        const currentLowerValue = lowerTierNumericCollection[currentLowerIdx];

        // Apply the triplet condition using the dedicated helper function.
        if (checkAscendingTripletCondition(currentUpperValue, currentMiddleValue, currentLowerValue)) {
          // If the condition is met, increment the counter for successful combinations.
          successfulTripletCombinations = successfulTripletCombinations + 1;
        }
      }
    }
  }

  // --- Output Result ---

  // Print the final accumulated count of valid triplets to the console.
  console.log(successfulTripletCombinations);
}

// --- Entry Point for Execution ---

// This block handles reading input from standard I/O (e.g., /dev/stdin in Unix-like systems)
// and passes it to the main analysis function.
try {
  // Dynamically require the 'fs' (file system) module, typically available in Node.js environments.
  const fileSystemModule = require('fs');

  // Read the entire content of '/dev/stdin' as a UTF-8 encoded string.
  const inputDataStream = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main analysis function with the obtained input data.
  analyzeInputData(inputDataStream);

} catch (errorReadingFile) {
  // Catch any errors that occur during file reading (e.g., file not found, permission issues).
  console.error("An error occurred while attempting to read input from /dev/stdin:", errorReadingFile.message);
  // In a real-world scenario, you might also log the stack trace: console.error(errorReadingFile);
  // For testing purposes or environments without /dev/stdin, one might call analyzeInputData
  // with a hardcoded test string here instead.
}