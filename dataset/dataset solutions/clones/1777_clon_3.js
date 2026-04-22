// This module defines a function to analyze a list of numbers for specific divisibility patterns.

/**
 * Processes a raw string input to identify and count elements that are not
 * perfectly divisible by any other distinct element within the provided list.
 *
 * @param {string} rawSourceText - The complete raw input as a multi-line string.
 *                                 Expected format: first line is ignored,
 *                                 second line contains space-separated numbers.
 */
const analyzeNumericSeries = (rawSourceText) => {
  // --- Input Validation and Initial Data Extraction (Type III: Guard Clauses, Robustness) ---
  if (typeof rawSourceText !== 'string' || rawSourceText.trim().length === 0) {
    console.error("Input error: The provided source text is empty or not a string.");
    return; // Exit early
  }

  // Split the entire input string into an array of individual lines.
  const segmentedLines = rawSourceText.split('\n');

  // Verify that there are at least two lines, as the second line holds the data.
  if (segmentedLines.length < 2) {
    console.error("Input error: Insufficient lines in the source text. Expected at least two lines.");
    return; // Exit early
  }

  // Extract the second line, which contains the space-separated numeric values.
  const dataLine = segmentedLines[1];

  // Parse the numeric values from the data line.
  // Type III: Added robust parsing with `parseFloat` and filtering to exclude
  // non-numeric entries and zero values (to prevent division by zero later).
  const numericDataElements = dataLine
    .split(' ')
    .map(strElement => parseFloat(strElement)) // Convert string parts to floating-point numbers
    .filter(val => !isNaN(val) && val !== 0); // Keep only valid, non-zero numbers

  // If no valid numbers remain after parsing and filtering, there's nothing to process.
  if (numericDataElements.length === 0) {
    console.log("No valid non-zero numeric elements were found for analysis.");
    return; // Exit early
  }

  // --- Core Logic for Divisibility Check (Type II & III: Renaming, Rewriting, Helper Variables) ---

  // Initialize a counter for elements that *do* have at least one divisor
  // among the other elements in the list.
  let elementsWithDivisorsFound = 0; // Renamed `count`

  // Iterate through each number in the collection as the potential dividend.
  for (let currentDividendIndex = 0; currentDividendIndex < numericDataElements.length; currentDividendIndex++) { // Renamed `i`
    const dividendValue = numericDataElements[currentDividendIndex]; // Renamed `test`

    // Type III: Introduce a boolean flag to track if a divisor has been identified
    // for the current `dividendValue`.
    let hasFoundAnyValidDivisor = false;

    // Iterate through all other numbers in the collection as potential divisors.
    for (let potentialDivisorIndex = 0; potentialDivisorIndex < numericDataElements.length; potentialDivisorIndex++) { // Renamed `j`
      // Type III: Rewriting `i != j` using an explicit `continue` for self-comparison.
      if (currentDividendIndex === potentialDivisorIndex) {
        continue; // Skip comparing an element with itself.
      }

      const divisorValue = numericDataElements[potentialDivisorIndex]; // Helper variable for clarity

      // Type III: Although filtered out earlier, an additional check for robustness.
      // Division by zero is undefined and can lead to errors or NaN results.
      if (divisorValue === 0) {
        continue; // Skip zero divisors, if any somehow slipped through or for future modifications.
      }

      // Check if the current dividend is perfectly divisible by the potential divisor.
      if (dividendValue % divisorValue === 0) {
        elementsWithDivisorsFound++; // Increment the counter if a divisor is found.
        hasFoundAnyValidDivisor = true; // Mark that a divisor was found for this dividend.
        break; // Type III: Keep `break` as it's essential for efficiency and logic (only one divisor needed).
      }
    }
  }

  // --- Final Calculation and Output (Type III: Intermediate Variable) ---

  // Calculate the number of elements that did *not* have any other element
  // as a perfect divisor within the list.
  const resultCountOfUniqueDivisibleElements = numericDataElements.length - elementsWithDivisorsFound; // Intermediate variable

  // Output the final computed result.
  console.log(resultCountOfUniqueDivisibleElements);
};

// --- Execution Entry Point (Type III: Encapsulation, Error Handling) ---

// Self-invoking anonymous function to manage the execution flow,
// including reading from standard input and handling potential errors.
(function initializeApplication() {
  try {
    // Dynamically load the 'fs' module for file system operations.
    const fileSystemHandler = require('fs');
    // Read the entire content from the standard input as a UTF-8 string.
    const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Pass the raw input content to our main processing function.
    analyzeNumericSeries(rawInputContent);
  } catch (operationError) {
    // Provide a detailed error message if file reading or any other operation fails.
    console.error(`Application encountered an unrecoverable error: ${operationError.message}`);
    // Optionally, could log to a file or trigger further error handling.
  }
})();