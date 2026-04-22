/**
 * This module is designed to process a multi-line input string,
 * primarily focusing on extracting and analyzing a collection of identifiers
 * to determine the count of unique elements among them.
 * It simulates a common pattern for competitive programming or script execution
 * where input is read from standard input.
 */

/**
 * Executes the core data analysis workflow.
 * This function takes a complete raw text payload, typically obtained from a source
 * like standard input, parses it into distinct lines, identifies the relevant
 * data segments, and then calculates the number of unique data identifiers found.
 *
 * @param {string} rawTextPayload - The entire input content as a single string.
 *                                  It is expected to contain individual data points
 *                                  separated by newline characters.
 */
function processInputDataSet(rawTextPayload) {
  // Begin with robust input validation to handle edge cases gracefully.
  // If the input is not a valid string or is empty, an error is logged,
  // and the processing is halted to prevent further issues.
  if (typeof rawTextPayload !== 'string' || rawTextPayload === null || rawTextPayload === undefined || rawTextPayload.trim().length === 0) {
    console.error("Input Error: The provided payload is invalid or empty. A non-empty string is required for processing.");
    return; // Exit the function early if input is invalid.
  }

  // Define the character sequence used to delineate individual lines within the input.
  // Note: The original code snippet contained "/n". This implementation assumes the
  // intended meaning was the standard newline character "\n" for practical parsing
  // of typical multi-line input from sources like /dev/stdin.
  const LINE_SEPARATOR_CHARACTER = "\n";

  // Divide the entire raw payload into an array of strings, where each string
  // represents a single line from the input based on the defined separator.
  const allInputSegments = rawTextPayload.split(LINE_SEPARATOR_CHARACTER);

  // Initialize variables to store the extracted data.
  // The 'primaryDirective' variable will hold the content of the very first line,
  // which might serve as a metadata or a guiding parameter for the rest of the data.
  let primaryDirective = null;
  // The 'relevantDataItems' array will store the actual data points that need
  // to be analyzed for uniqueness.
  let relevantDataItems = [];

  // Condition to ensure that the input array has at least one segment
  // before attempting to access the first element as the primary directive.
  if (allInputSegments.length > 0) {
    primaryDirective = allInputSegments[0]; // Extract the first line.
  }

  // This block meticulously replicates the specific slicing logic observed
  // in the original code's data extraction (`args.slice(1, args.length - 1)`).
  // This particular slicing behavior implies taking elements from the second segment
  // up to, but not including, the very last segment in the array.
  // This has two key implications:
  // 1. It naturally omits any empty string that might result from a trailing
  //    newline character in the input (e.g., "val1\nval2\n" -> ["val1", "val2", ""]).
  // 2. Crucially, if the input does NOT end with a newline (e.g., "val1\nval2"),
  //    this logic will also discard the last actual data item ("val2" in this example).
  //    This behavior, while potentially unexpected, is preserved for functional equivalence.
  if (allInputSegments.length > 1) { // Requires at least two segments for `slice(1, N-1)` to yield data.
    relevantDataItems = allInputSegments.slice(1, allInputSegments.length - 1);
  }

  /**
   * Internal helper function to calculate the number of unique elements within a given array.
   * This utility enhances modularity and readability of the main processing logic.
   *
   * @param {Array<string>} collectionOfElements - An array of string elements for uniqueness check.
   * @returns {number} The total count of distinct elements found in the collection.
   */
  const calculateDistinctElementCount = (collectionOfElements) => {
    // Perform a quick check to prevent errors with non-array or empty inputs.
    if (!Array.isArray(collectionOfElements) || collectionOfElements.length === 0) {
      return 0; // No unique elements if the collection is empty or invalid.
    }

    // Leverage the JavaScript Set object, which inherently stores only unique values.
    // The size property of the Set then directly provides the count of distinct elements.
    const uniqueElementsSet = new Set(collectionOfElements);
    return uniqueElementsSet.size;
  };

  // Invoke the helper function to compute the final unique count based on the extracted data items.
  const finalUniqueItemsCount = calculateDistinctElementCount(relevantDataItems);

  // Output the computed unique count to the standard output stream.
  console.log(finalUniqueItemsCount);
}

// --- Program Entry Point and Input Acquisition ---

// Acquire the native Node.js 'fs' (file system) module.
// This module provides utilities for interacting with the file system,
// including reading from standard input.
const fileSystemUtility = require("fs");

// Read the entire content from the standard input stream.
// On Unix-like systems, '/dev/stdin' is a symbolic link to the standard input.
// The 'utf8' encoding ensures that multi-byte characters are handled correctly.
const standardInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

// Initiate the primary data processing function with the content obtained from standard input.
processInputDataSet(standardInputContent);