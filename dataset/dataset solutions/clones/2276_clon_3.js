// This module contains a function designed to process an incoming data stream
// and evaluate a specific numerical condition based on its contents.
function EvaluateCondition(rawInputStream) {
  // Normalize the input to a string, remove leading/trailing whitespace,
  // and then split it into individual components using any sequence of whitespace characters.
  const inputComponents = String(rawInputStream).trim().split(/\s+/);

  // A brief check to ensure we have at least two components for our calculations.
  // If not, the subsequent Number() conversions will produce NaN for missing elements,
  // leading to predictable comparison results (NaN comparisons are always false).
  if (inputComponents.length < 2) {
    // Log a diagnostic message for insufficient input, but proceed as the Number()
    // conversion of 'undefined' will result in NaN, mimicking the original's implicit behavior
    // where comparisons involving NaN typically yield false.
    console.error("Input stream contains fewer than the expected two numeric components. Proceeding with potential NaN values.");
  }

  // Explicitly convert the first component to a number.
  const primaryFactor = Number(inputComponents[0]);
  // Explicitly convert the second component to a number.
  const comparisonThreshold = Number(inputComponents[1]);

  // Define a numerical constant that is used in the calculation.
  const standardCoefficient = 500;

  // Compute an intermediate product using the primary factor and the coefficient.
  const computedProduct = primaryFactor * standardCoefficient;

  // Initialize the decision variable to its default negative state.
  let finalOutcomeMessage = "NO";

  // Perform the core comparison logic.
  // Note: Comparisons involving NaN (e.g., NaN > X or Y > NaN) will always evaluate to false,
  // which aligns with the implicit behavior of the original code if input was non-numeric.
  if (computedProduct > comparisonThreshold) {
    // If the computed product exceeds the threshold, update the decision.
    finalOutcomeMessage = "YES";
  }

  // Output the determined message to the standard console.
  console.log(finalOutcomeMessage);
}

// The following line is crucial for standard input/output operations in this environment.
// It reads the entire content from /dev/stdin as a UTF-8 string and passes it to our function.
// This section should not be altered to maintain execution compatibility.
EvaluateCondition(require("fs").readFileSync("/dev/stdin", "utf8"));