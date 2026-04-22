const fileSystemUtils = require('fs'); // Renamed module import variable

// --- Input Processing Section ---

let rawInputData = ''; // Renamed input variable
try {
  // Attempt to read raw data from standard input path
  rawInputData = fileSystemUtils.readFileSync('/dev/stdin', 'utf8');
} catch (errorReadingInput) {
  // In case of an error during file reading, log and exit or handle gracefully
  console.error("Error reading input data:", errorReadingInput.message);
  process.exit(1); // Terminate the process
}

// Ensure the input is not empty after trimming
if (!rawInputData.trim()) {
  console.error("Input data is empty after trimming. Exiting.");
  process.exit(1);
}

// Split the raw string into individual lines, removing any empty lines resulting from extra newlines
const inputLines = rawInputData
  .trim() // Remove leading/trailing whitespace from the whole input
  .split("\n") // Split into an array of lines
  .filter(line => line.trim() !== ''); // Filter out any entirely empty lines

// Basic validation for the number of expected input lines
const MIN_REQUIRED_LINES = 3; // N1, arr1, arr2 (skipping the line for N2, which is not used in original logic)
if (inputLines.length < MIN_REQUIRED_LINES) {
  console.error(`Insufficient input lines. Expected at least ${MIN_REQUIRED_LINES}, got ${inputLines.length}.`);
  process.exit(1);
}

// Parse the first line as the expected length of the primary data set
const firstArrayExpectedLength = parseInt(inputLines[0], 10);
if (isNaN(firstArrayExpectedLength) || firstArrayExpectedLength < 0) {
  console.error("Invalid value for primary array expected length (N1). Must be a non-negative number.");
  process.exit(1);
}

// Parse the second line (index 1) into the primary data set
const primaryDataSet = inputLines[1]
  .split(" ") // Split by space
  .filter(s => s.trim() !== '') // Filter out empty strings from multiple spaces
  .map(Number); // Convert to numbers

// Optional: Validate if the parsed primaryDataSet length matches the expected length
if (primaryDataSet.length !== firstArrayExpectedLength) {
  // This is a common scenario in competitive programming where N1 might be a hint or actual length.
  // The original code uses N1 in the loop, so we must respect that.
  // console.warn(`Warning: Primary data set length (${primaryDataSet.length}) does not match expected length (${firstArrayExpectedLength}). Proceeding with specified limit.`);
}

// Parse the fourth line (index 3) into the query items
// Note: The original code implicitly skips inputLines[2] (which would be N2 if present)
if (inputLines.length < 4) { // Ensure line 3 (index 3) exists for query items
  console.error("Input line for query items (arr2) is missing.");
  process.exit(1);
}
const queryItems = inputLines[3]
  .split(" ") // Split by space
  .filter(s => s.trim() !== '') // Filter out empty strings
  .map(Number); // Convert to numbers

// --- Core Logic Function Definition ---

/**
 * Checks for the presence of a target value within a specified subset of a collection.
 *
 * @param {number} itemToFind - The value to search for.
 * @param {number[]} sourceCollection - The array to search within.
 * @param {number} searchLimit - The maximum number of elements to check from the beginning of the collection.
 * @returns {number} - Returns 1 if the item is found within the specified limit, otherwise 0.
 */
const checkPresenceInSubset = (itemToFind, sourceCollection, searchLimit) => {
  // Guard clauses for robustness
  if (!Array.isArray(sourceCollection) || sourceCollection.length === 0 || searchLimit <= 0) {
    // console.log(`Debug: searchPresenceInSubset called with invalid parameters. Item: ${itemToFind}, Collection: ${sourceCollection}, Limit: ${searchLimit}`);
    return 0; // Cannot search an invalid or empty collection, or with a non-positive limit
  }

  let matchLocated = false; // Flag to indicate if the item was found
  let currentPosition = 0; // Loop iterator for the collection

  // Iterate up to the specified search limit or the actual length of the collection, whichever is smaller
  while (currentPosition < searchLimit && currentPosition < sourceCollection.length) {
    if (sourceCollection[currentPosition] === itemToFind) {
      matchLocated = true; // Item found
      break; // Exit the loop early as we only need to know presence
    }
    currentPosition++; // Move to the next element
  }

  return matchLocated ? 1 : 0; // Convert boolean result to a numeric indicator
};

// --- Main Execution Logic ---

// Apply the search function to each query item and collect the results
const individualMatchResults = queryItems.map(currentQueryElement =>
  checkPresenceInSubset(currentQueryElement, primaryDataSet, firstArrayExpectedLength)
);

// Optional: Log intermediate results for debugging
// console.log("Debug: Individual match results for query items:", individualMatchResults);

// Sum up all the individual match indicators to get the total count of found items
const totalMatchesFound = individualMatchResults.reduce((totalFoundCount, individualMatch) => {
  // Accumulate the count of items found
  return totalFoundCount + individualMatch;
}, 0); // Start the sum from zero

// Output the final computed result to the console
console.log(totalMatchesFound);