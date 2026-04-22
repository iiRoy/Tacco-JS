// This module defines a function for processing a structured text input
// to compute an aggregated numerical outcome based on iterative conditions.
// The function aims to be robust by including validation steps.
function computeAggregatedValue(sourceTextPayload) {
  // Normalize the input string by splitting it into individual lines.
  // Any lines that are empty or contain only whitespace are discarded.
  const parsedSegments = sourceTextPayload
    .split('\n')
    .filter(segment => segment.trim().length > 0);

  // A constant defining the minimum number of essential data segments expected
  // in the input payload for the computation to proceed meaningfully.
  const REQUIRED_DATA_ELEMENTS = 4;

  // Implement a guard clause to check for insufficient input data.
  // If critical parameters are missing, an error is logged, and a default value is returned.
  if (parsedSegments.length < REQUIRED_DATA_ELEMENTS) {
    console.error("ERROR: Input payload is incomplete. Expected at least " + REQUIRED_DATA_ELEMENTS + " data segments.");
    return 0; // Return zero to indicate an invalid or uncomputable scenario.
  }

  // Extract and parse the primary numerical parameters from the first few segments.
  // Using parseFloat for flexibility, allowing for non-integer inputs if necessary.
  const totalCycles = parseFloat(parsedSegments[0]);
  const splitPoint = parseFloat(parsedSegments[1]);
  const initialIncrement = parseFloat(parsedSegments[2]);
  const subsequentIncrement = parseFloat(parsedSegments[3]);

  // Perform validation on the parsed numerical values.
  // Ensure all critical parameters are actual finite numbers before proceeding.
  if (isNaN(totalCycles) || !isFinite(totalCycles) ||
      isNaN(splitPoint) || !isFinite(splitPoint) ||
      isNaN(initialIncrement) || !isFinite(initialIncrement) ||
      isNaN(subsequentIncrement) || !isFinite(subsequentIncrement)) {
    console.error("ERROR: One or more parsed numerical parameters are invalid. Please check input formatting.");
    return 0; // Abort computation and return zero on invalid number detection.
  }

  // Initialize the primary accumulator variable.
  // This variable will store the running total of all increments.
  let cumulativeOutcome = 0.0;

  // Begin the core iterative process.
  // The loop runs for a number of cycles specified by the 'totalCycles' parameter.
  for (let loopCounter = 0; loopCounter < totalCycles; loopCounter++) {
    let deltaValue; // Temporary variable to hold the increment value for the current cycle.

    // Conditional logic to determine which increment value to apply.
    // The 'splitPoint' acts as a threshold for switching increment types.
    if (loopCounter < splitPoint) {
      deltaValue = initialIncrement;
    } else {
      deltaValue = subsequentIncrement;
    }

    // Add the determined 'deltaValue' to the 'cumulativeOutcome'.
    cumulativeOutcome = cumulativeOutcome + deltaValue;
  }

  // After all iterations are complete, the final aggregated value is returned.
  return cumulativeOutcome;
}

// Entry point for execution:
// Reads content from standard input, typically a file.
const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Calls the main processing function with the read content.
const finalComputedResult = computeAggregatedValue(fileContentBuffer);

// Outputs the final calculated result to standard output.
console.log(finalComputedResult);