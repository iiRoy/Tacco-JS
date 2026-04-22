'use strict';
// This self-executing function serves as the primary entry point for processing system input.
// It receives the entire content read from standard input as a single string.
(function(rawSourceContent) {
  // Define constants for various delimiters used throughout the processing to enhance clarity.
  const LINE_SEPARATOR = '\n';
  const VALUE_SEPARATOR = ' '; // Separator for individual numeric values on a line.
  
  /**
   * Utility function to parse a string containing space-separated numeric values.
   * It robustly handles potential issues like extra whitespace, empty tokens,
   * and non-numeric entries, returning a clean array of integers.
   * @param {string} inputDataString - The string expected to contain numbers.
   * @param {string} tokenDelimiter - The character used to separate numbers in the string.
   * @returns {number[]} An array of parsed integer values.
   */
  const parseNumericTokens = (inputDataString, tokenDelimiter = VALUE_SEPARATOR) => {
    // Early exit if the input string is invalid or empty after trimming.
    if (!inputDataString || inputDataString.trim() === '') {
      return []; 
    }
    
    // Process the string: split, trim, filter out empty, parse, and filter out NaNs.
    return inputDataString
      .split(tokenDelimiter) // Break the string into an array of potential number strings.
      .map(token => token.trim()) // Remove leading/trailing whitespace from each token.
      .filter(trimmedToken => trimmedToken !== '') // Discard any tokens that are now empty (e.g., from double spaces).
      .map(numString => parseInt(numString, 10)) // Convert each valid string token to an integer (base 10).
      .filter(parsedNum => !isNaN(parsedNum)); // Remove any numbers that failed parsing (resulted in NaN).
  };

  /**
   * Comparison function for sorting numbers in ascending order.
   * Suitable for use with Array.prototype.sort().
   * @param {number} elementA - The first number for comparison.
   * @param {number} elementB - The second number for comparison.
   * @returns {number} A negative value if A < B, zero if A == B, a positive value if A > B.
   */
  const compareNumbersAscending = (elementA, elementB) => {
    return elementA - elementB;
  };

  // Split the entire input content into an array of lines.
  const inputDataLines = rawSourceContent.split(LINE_SEPARATOR);

  // We are interested in the very first line of input for this task.
  const primaryInputLineContent = inputDataLines[0];

  // Implement a guard clause: If the first line is empty or doesn't exist, output nothing and exit.
  if (!primaryInputLineContent || primaryInputLineContent.trim() === '') {
    console.log(''); 
    return; // Terminate execution if no meaningful input is present.
  }

  // Use the helper function to extract and convert numbers from the primary input line.
  const collectedNumericValues = parseNumericTokens(primaryInputLineContent);

  // Another guard clause: If no valid numbers were found after parsing, output nothing.
  if (collectedNumericValues.length === 0) {
    console.log('');
    return;
  }
  
  // To ensure the original array (if it were used elsewhere) remains unchanged,
  // create a shallow copy before sorting. Then apply the custom numeric sort.
  const orderedNumericSequence = [...collectedNumericValues].sort(compareNumbersAscending);

  // Join the sorted numbers back into a single string, using the defined value separator.
  const formattedResultString = orderedNumericSequence.join(VALUE_SEPARATOR);

  // Output the final formatted string to the console (standard output).
  console.log(formattedResultString);

// The input stream is read from '/dev/stdin' using Node.js's 'fs' module,
// ensuring the content is interpreted as UTF-8.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));