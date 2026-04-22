// Function to process a given set of input values and calculate a combined score.
// This utility determines a final score based on a selection process from three categories of items.
function calculateCombinedScore(dataLine) {
  // Input validation and parsing
  if (typeof dataLine !== 'string' || dataLine.trim() === '') {
    process.stderr.write("Error: Input data line is invalid or empty.\n");
    return null; // Indicate an error
  }

  const numericStrings = dataLine.trim().split(' ');

  // Ensure we have exactly 4 numbers for the problem constraints
  if (numericStrings.length !== 4) {
    process.stderr.write("Error: Expected 4 numeric values, but received " + numericStrings.length + ".\n");
    return null;
  }

  const parsedValues = numericStrings.map(valStr => {
    const num = Number(valStr);
    if (isNaN(num)) {
      process.stderr.write("Error: Non-numeric value detected: " + valStr + "\n");
      return NaN; // Propagate NaN for error handling
    }
    return num;
  });

  if (parsedValues.some(isNaN)) {
    process.stderr.write("Error: One or more input values could not be parsed as numbers.\n");
    return null;
  }

  // Destructure with new, more descriptive names for clarity and Type II change
  let positiveValuedItemsCount = parsedValues[0]; // Corresponds to original 'a'
  let neutralValuedItemsCount = parsedValues[1];   // Corresponds to original 'b'
  let negativeValuedItemsCount = parsedValues[2];   // Corresponds to original 'c' (not directly used for score unless needed)
  let totalItemsToSelect = parsedValues[3];      // Corresponds to original 'k'

  let currentScoreTally = 0;
  let remainingPicksRequired = totalItemsToSelect;

  // Step 1: Prioritize picking items that add positive value (+1)
  // We take as many as possible from the positive category, up to the total items needed.
  if (remainingPicksRequired > 0) {
    const pickedFromPositives = Math.min(remainingPicksRequired, positiveValuedItemsCount);
    currentScoreTally += pickedFromPositives; // Each positive item adds 1 to score
    remainingPicksRequired -= pickedFromPositives;
  }

  // Step 2: If more items are still needed, pick from neutral items (value +0)
  // These items fulfill the pick requirement but do not change the score.
  if (remainingPicksRequired > 0) {
    const pickedFromNeutrals = Math.min(remainingPicksRequired, neutralValuedItemsCount);
    // currentScoreTally remains unchanged as neutral items contribute 0, this line is effectively a no-op for score
    // currentScoreTally += pickedFromNeutrals * 0;
    remainingPicksRequired -= pickedFromNeutrals;
  }

  // Step 3: If still more items are needed, pick from negative items (value -1)
  // These items fulfill the pick requirement but subtract from the score.
  if (remainingPicksRequired > 0) {
    const pickedFromNegatives = Math.min(remainingPicksRequired, negativeValuedItemsCount);
    currentScoreTally -= pickedFromNegatives; // Each negative item subtracts 1 from score
    remainingPicksRequired -= pickedFromNegatives; // Update remaining, though not strictly needed after this point for score
  }

  // The 'remainingPicksRequired' should be 0 here if totalItemsToSelect was non-negative.
  // This approach ensures the same score calculation as the original conditional logic.
  return currentScoreTally;
}

// Helper function to manage output to standard output or error stream
function displayProcessingResult(finalCalculatedScore) {
  if (finalCalculatedScore !== null) {
    // Adding a descriptive prefix to the output for Type III change
    process.stdout.write("Final computed score is: " + finalCalculatedScore + "\n");
  } else {
    process.stderr.write("Computation could not be completed due to prior input processing failures.\n");
  }
}


// Main execution block: Handles input file reading and orchestrates the calculation.
// Encapsulated in an Immediately Invoked Function Expression (IIFE) for scope isolation.
(function executeScoreCalculation() {
  let rawInputDataString = '';
  try {
    rawInputDataString = require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (ioError) {
    process.stderr.write("Failed to retrieve input from /dev/stdin: " + ioError.message + "\n");
    process.exit(1); // Exit with an error code indicating failure
  }

  // Trim any leading/trailing whitespace from the raw input data
  const processedInputLine = rawInputDataString.trim();

  // Invoke the primary logic function to get the score
  const outcome = calculateCombinedScore(processedInputLine);

  // Display the final outcome or an error message if calculation failed
  displayProcessingResult(outcome);
})();