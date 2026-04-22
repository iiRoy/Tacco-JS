// Function to calculate the median (central value) of a given array of numbers.
// This implementation ensures numerical sorting and handles edge cases like empty arrays.
function calculateCentralValue(numericDataSet) {
  // Defensive check: If the input array is null, undefined, or empty, a median cannot be determined.
  // Returning null signifies an invalid or undefined median for such cases.
  if (!numericDataSet || numericDataSet.length === 0) {
    return null;
  }

  // To avoid modifying the original array, we first create a shallow copy.
  // Then, we sort this copy numerically using a custom comparator (a - b).
  // Standard JavaScript sort() treats numbers as strings by default, leading to incorrect results.
  const numericallySortedData = [...numericDataSet].sort((a, b) => a - b);

  // Store the total number of elements for clearer calculation.
  const totalElements = numericallySortedData.length;

  // Determine the middle index. For an array with an odd number of elements,
  // this is the exact median's position. For an even number, this points
  // to the lower of the two central elements, which is a common definition
  // in competitive programming contexts for simplicity.
  const centralIndex = Math.floor(totalElements / 2);

  // Return the element found at the calculated central index.
  return numericallySortedData[centralIndex];
}

// The primary function responsible for processing the raw input string,
// performing the core logic, and outputting the final result.
function ProcessInputData(rawInputText) {
  // Input validation: Ensure the raw input is a non-empty string.
  if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    console.error("Error: Provided input data is empty or not in the expected string format.");
    return; // Terminate execution if input is invalid.
  }

  // Split the multi-line input string into an array of individual lines.
  const inputLines = rawInputText.split("\n");

  // Further input validation: We expect at least two lines (one for N, one for the array).
  if (inputLines.length < 2) {
    console.error("Error: Insufficient data lines in input. Expected at least two lines.");
    return;
  }

  // Parse the first line to get the count of elements (N).
  // `trim()` removes leading/trailing whitespace, `parseInt` converts to integer,
  // and `10` specifies base-10 radix for robust parsing.
  const elementCount = parseInt(inputLines[0].trim(), 10);

  // Validate the parsed element count. It must be a valid number and positive.
  if (isNaN(elementCount) || elementCount <= 0) {
    console.error("Error: The declared element count is invalid or non-positive.");
    return;
  }

  // Parse the second line which contains the space-separated numeric values.
  // `trim()` cleans whitespace, `split(" ")` divides into strings,
  // and `map(Number)` converts each string element into a true number.
  const numericValues = inputLines[1].trim().split(" ").map(Number);

  // Optional validation: Check if the number of parsed values matches the declared count.
  // This can catch malformed input where N doesn't match the actual array size.
  if (numericValues.length !== elementCount) {
    console.warn(`Warning: Declared element count (${elementCount}) does not match the actual number of parsed values (${numericValues.length}). Proceeding with the parsed values.`);
    // Depending on requirements, one might choose to exit here or adjust elementCount.
    // For this problem, we'll proceed using the actual length of numericValues.
  }

  // This array will accumulate the median of every single contiguous subarray possible from `numericValues`.
  const allSubarrayMediansCollection = [];

  // Outer loop: Iterates through all possible starting positions for a subarray.
  for (let startIndex = 0; startIndex < elementCount; startIndex++) {
    // Inner loop: Iterates through all possible ending positions for a subarray.
    // `endIndex` goes up to `elementCount` (exclusive for slice, inclusive for loop boundary)
    // to ensure subarrays include the last element. `startIndex + 1` guarantees non-empty subarrays.
    for (let endIndex = startIndex + 1; endIndex <= elementCount; endIndex++) {
      // Extract the current contiguous subarray using `slice()`.
      // `slice(startIndex, endIndex)` creates a new array from `startIndex` up to (but not including) `endIndex`.
      const currentSubarray = numericValues.slice(startIndex, endIndex);

      // Calculate the median of this extracted subarray.
      const currentSubarrayMedian = calculateCentralValue(currentSubarray);

      // If a valid median was calculated (i.e., not null, which signifies an empty input to calculateCentralValue,
      // though slice(s,e) with e > s ensures non-empty here), add it to our collection.
      if (currentSubarrayMedian !== null) {
        allSubarrayMediansCollection.push(currentSubarrayMedian);
      }
    }
  }

  // After processing all subarrays and collecting their medians,
  // calculate the median of this collection of medians.
  const finalOverallMedian = calculateCentralValue(allSubarrayMediansCollection);

  // Output the final computed median to the console.
  console.log(finalOverallMedian);
}

// Entry point for execution: This block handles reading input from standard input
// and initiating the main processing logic. It includes basic error handling for file operations.
try {
  // Dynamically require the 'fs' (file system) module.
  const fileSystemModule = require("fs");
  // Read the entire content of standard input (`/dev/stdin`) as a UTF-8 encoded string.
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  // Pass the read content to our main processing function.
  ProcessInputData(standardInputContent);
} catch (error) {
  // Catch and log any errors that occur during file reading or subsequent processing.
  console.error("An unhandled error occurred during input processing:", error.message);
  // In a production environment, more sophisticated error reporting or recovery might be implemented.
}