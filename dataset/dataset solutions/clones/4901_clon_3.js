function ProcessInputData(rawDataString) {
  // This function is designed to ingest raw string input, parse specific numeric
  // data, perform a calculation based on these numbers, and output the result.

  // Step 1: Split the entire input string into an array of individual lines.
  const contentLines = rawDataString.split("\n");

  // Validate that we have at least two lines of input to proceed.
  if (contentLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines of data.");
    return; // Exit if input is malformed.
  }

  // Step 2: Parse control parameters from the first line of input.
  // These parameters are space-separated.
  const firstLineParts = contentLines[0].split(" ");
  const itemQuantityParameter = parseInt(firstLineParts[0], 10); // Represents 'K' from original
  const auxiliaryTypeIdentifier = parseInt(firstLineParts[1], 10); // Represents 'T' from original (unused in final calculation)

  // Step 3: Parse the array of numeric values from the second line.
  // Each value is expected to be an integer.
  let collectionOfValues = contentLines[1].split(" ").map((strElement) => {
    return parseInt(strElement, 10);
  });

  // Additional validation for the numeric collection:
  // Ensure that all parsed elements are valid numbers and the collection is not empty.
  if (collectionOfValues.some(isNaN)) {
    console.error("Error: Detected non-numeric data in the second line of input.");
    return;
  }
  if (collectionOfValues.length === 0) {
    // If there are no values, the result is implicitly zero based on problem context.
    console.log(0);
    return;
  }

  // Step 4: Sort the numeric collection.
  // The original sort `(a, b) => a < b` is ambiguous; a standard descending sort
  // `(valA, valB) => valB - valA` is used to ensure the largest element is at index 0.
  collectionOfValues.sort((valA, valB) => valB - valA);

  // Step 5: Calculate the sum of all elements in the sorted collection.
  // This uses the 'reduce' method for aggregation.
  const totalSumOfElements = collectionOfValues.reduce((currentAccumulator, currentElement) => {
    return currentAccumulator + currentElement;
  }, 0);

  // Step 6: Identify the largest element.
  // After descending sort, the largest element is at the first position (index 0).
  const maximumElement = collectionOfValues[0];

  // Step 7: Perform the primary calculation.
  // The formula is derived from `2 * largest - 1 - sum(all_elements)`.
  // This can be conceptualized as `largest - 1 - (sum_of_other_elements)`.
  const computedDifference = (2 * maximumElement) - 1 - totalSumOfElements;

  // Step 8: Determine the final result.
  // The result must be non-negative; if the computed difference is negative,
  // it is clamped to zero. This is equivalent to `Math.max(value, 0)`.
  const finalOutputValue = Math.max(computedDifference, 0);

  // Step 9: Output the final calculated value to the console.
  console.log(finalOutputValue);
}

// --- Application Entry Point and Input Handling ---
// This block handles reading input from the standard input stream
// and calling the main processing function.
try {
  // Dynamically import the 'fs' (file system) module for input reading.
  const fileSystemModule = require("fs");
  // Specify the standard input file path for typical competitive programming environments.
  const standardInputPath = "/dev/stdin";
  // Define the character encoding for reading the input file.
  const inputEncoding = "utf8";

  // Read the entire content of the standard input file synchronously.
  // This ensures all input is available before processing begins.
  const stdinContent = fileSystemModule.readFileSync(standardInputPath, inputEncoding);

  // Invoke the main processing logic with the content read from stdin.
  ProcessInputData(stdinContent);

} catch (processingError) {
  // If any error occurs during file reading or the main processing,
  // log the error message to the console.
  console.error("An unexpected error occurred during execution:", processingError.message);
  // Optionally, exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}