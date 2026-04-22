/*
 * This script processes a single line of numeric input,
 * sorts the numbers in descending order, and prints them
 * separated by spaces to standard output.
 *
 * It demonstrates robust input handling, explicit type conversion,
 * and a clear sorting mechanism for numerical sequences.
 */

// Define a main execution function to encapsulate the entire processing logic.
function executeNumericSortingTask() {
  // --- Input Acquisition Phase ---
  // Specify the standard input file path, typically '/dev/stdin' on Linux/macOS.
  const standardInputPath = '/dev/stdin';
  // Define the character encoding to use when reading the file content.
  const preferredEncoding = 'utf8';

  let rawBufferContent;
  try {
    // Attempt to read the entire content from the specified input source synchronously.
    // The `require('fs')` module provides essential file system utilities for Node.js.
    rawBufferContent = require('fs').readFileSync(standardInputPath, preferredEncoding);
  } catch (error) {
    // In case of any error during the file reading process (e.g., file not found, permission issues),
    // log an informative error message to the console and gracefully terminate the operation.
    console.error("Error encountered while attempting to read the input stream:", error.message);
    return; // Exit the function as input cannot be processed.
  }

  // Convert the buffer content obtained from the file into a string format.
  // Then, apply `.trim()` to remove any leading or trailing whitespace characters,
  // including newlines, which makes the input processing more consistent than just `replace(/\n$/, '')`.
  const cleanedInputLine = rawBufferContent.toString().trim();

  // --- Pre-processing and Validation Phase ---
  // If the input line becomes empty after trimming all whitespace, there are no numbers to process.
  if (cleanedInputLine.length === 0) {
    console.log(''); // Output an empty line to signify no processed numbers.
    return; // Terminate execution for an effectively empty input.
  }

  // Split the cleaned string into an array of potential number fragments.
  // Using a regular expression `/\s+/` ensures that multiple consecutive spaces
  // are treated as a single delimiter, leading to more robust tokenization.
  const stringFragments = cleanedInputLine.split(/\s+/);

  // Filter out any empty string elements that might have resulted from `split(/\s+/)`
  // when there were multiple spaces or leading/trailing spaces in the input.
  const nonBlankFragments = stringFragments.filter(fragment => fragment !== '');

  // After splitting and filtering, if no meaningful fragments remain, there's nothing to sort.
  if (nonBlankFragments.length === 0) {
    console.log(''); // Output an empty line.
    return; // Exit the function.
  }

  // --- Data Conversion Phase ---
  // Initialize an empty array that will store all successfully parsed numeric values.
  const parsedNumericValues = [];

  // Iterate over each string fragment obtained from the input.
  for (const currentFragment of nonBlankFragments) {
    // Attempt to convert the current string fragment into an integer (base 10).
    const numericRepresentation = parseInt(currentFragment, 10);
    // Check if the result of `parseInt` is not `NaN` (Not a Number),
    // indicating a successful conversion to a valid numerical value.
    if (!isNaN(numericRepresentation)) {
      parsedNumericValues.push(numericRepresentation);
    } else {
      // This block could optionally include logging for non-numeric input fragments,
      // e.g., `console.warn(`Skipping non-numeric fragment: "${currentFragment}"`);`
      // For this clone, we simply skip non-numeric entries without explicit warning.
    }
  }

  // If, after parsing all fragments, no valid numbers were collected, output an empty line.
  if (parsedNumericValues.length === 0) {
    console.log('');
    return;
  }

  // --- Sorting Phase ---
  // Define a custom comparison function for sorting numbers in descending order.
  // This helper function makes the sorting logic explicit and reusable.
  // For descending order, `b - a` ensures larger numbers come before smaller ones.
  const compareNumbersDescending = (firstValue, secondValue) => {
    return secondValue - firstValue;
  };

  // Apply the custom descending sort function to our array of parsed numbers.
  parsedNumericValues.sort(compareNumbersDescending);

  // --- Output Generation Phase ---
  // Join the sorted numbers back into a single string.
  // A space character is used as the delimiter between each number, as per requirement.
  const formattedOutputResult = parsedNumericValues.join(' ');

  // Print the final, sorted, space-separated string to standard output.
  console.log(formattedOutputResult);
}

// Immediately invoke the main function to start the execution flow
// as soon as the script is loaded and run.
executeNumericSortingTask();