// Helper function to robustly obtain input from standard stream
const obtainInputData = () => {
  try {
    // Utilizing Node.js 'fs' module to synchronously read from stdin
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (dataRetrievalError) {
    // Log an error if input cannot be read, and return an empty string
    // to allow the main processing logic to handle missing data gracefully.
    console.error("Input reading failure:", dataRetrievalError.message);
    return "";
  }
};

// Core function to process the numerical sequence logic
const processNumericalSequence = (sourceText) => {
  // Validate the input: ensure it's a non-empty string.
  // This acts as an early exit guard clause for invalid data types or empty inputs.
  if (typeof sourceText !== 'string' || sourceText.trim() === '') {
    // For an invalid or empty input, the result is considered zero.
    // An alternative could be to throw an error, depending on application requirements.
    return 0;
  }

  // Step 1: Parse raw input into potential numeric values.
  // - Split lines: Account for both Unix (`\n`) and Windows (`\r\n`) line endings.
  // - Filter out any lines that are empty or contain only whitespace.
  // - Map each valid line string to a number, trimming any leading/trailing whitespace.
  let potentialNumbers = sourceText.split(/\r?\n/)
                                   .filter(lineFragment => lineFragment.trim() !== '')
                                   .map(strValue => Number(strValue.trim()));

  // Step 2: Remove the initial element, typically a metadata header (e.g., count).
  // The original problem statement implies this first line is not part of the sum.
  if (potentialNumbers.length === 0) {
      // If no numbers remain after initial parsing, return 0.
      return 0;
  }
  // Store the discarded header value if needed, otherwise it's simply removed.
  const discardedHeader = potentialNumbers.shift();

  // Step 3: Filter out any values that failed to convert to a valid number (NaN).
  const verifiedNumericValues = potentialNumbers.filter(item => !isNaN(item));

  // Step 4: Ensure there are actual numbers left to process after all filtering.
  if (verifiedNumericValues.length === 0) {
    return 0;
  }

  // Step 5: Sort the remaining numerical elements in descending order.
  // This prepares the list so the largest number is at the beginning.
  let orderedNumericalElements = verifiedNumericValues.sort((valA, valB) => valB - valA);

  // Step 6: Perform the primary calculation.
  // The largest element is divided by two, and this forms the initial part of the sum.
  const primaryComponent = orderedNumericalElements[0];
  let currentAccumulatedSum = primaryComponent / 2.0; // Explicit float division

  // Step 7: Sum the rest of the elements.
  // Use `slice(1)` to get all elements except the first (which was already processed).
  // Then, use `reduce` to sum these remaining elements efficiently.
  const remainingElementsForSum = orderedNumericalElements.slice(1);
  const sumOfSubsequentElements = remainingElementsForSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Add the sum of the remaining elements to the initial primary component.
  currentAccumulatedSum += sumOfSubsequentElements;

  // Return the final computed result.
  return currentAccumulatedSum;
};

// Utility function to display the final outcome
const renderOutcome = (computedResult) => {
  // Add a check to ensure the result is a valid number before logging.
  if (typeof computedResult === 'number' && !isNaN(computedResult)) {
    console.log(computedResult);
  } else {
    // Fallback or error handling for non-numerical results.
    console.error("Attempted to display an invalid result:", computedResult);
    console.log(0); // Display 0 as a safe default.
  }
};

// Main execution block: Orchestrates the input, processing, and output.
const initiateProcessing = () => {
  const rawInputData = obtainInputData();
  const finalCalculatedValue = processNumericalSequence(rawInputData);
  renderOutcome(finalCalculatedValue);
};

// Trigger the application's entry point.
initiateProcessing();