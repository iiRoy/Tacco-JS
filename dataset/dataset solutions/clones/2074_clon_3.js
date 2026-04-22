// Core function to evaluate a specific mathematical condition based on input values.
// This function replaces the original 'Main' and handles the primary logic.
function processInputData(rawInputLine) {
  // Comment: The input is expected to be a single string containing three space-separated non-negative numbers.
  // We'll parse these numbers and apply a transformed condition.

  // Step 1: Pre-process the raw input string.
  // Remove leading/trailing whitespace and split the string into an array of potential number strings.
  const numericStringComponents = rawInputLine.trim().split(" ");

  // Step 2: Basic input validation - ensure we have enough components.
  // Adding this guard clause improves robustness, a Type III addition.
  if (numericStringComponents.length < 3) {
    console.error("Input parsing error: Expected at least three numerical components.");
    // In a real application, more sophisticated error handling or default values might be used.
    return;
  }

  // Step 3: Parse the string components into floating-point numbers.
  // Using parseFloat explicitly is a Type II change from implicit Number() conversion.
  let valueX = parseFloat(numericStringComponents[0]);
  let valueY = parseFloat(numericStringComponents[1]);
  let valueZ = parseFloat(numericStringComponents[2]);

  // Step 4: Validate parsed numerical values.
  // Ensure they are valid numbers and non-negative, as square roots of negative numbers are complex.
  // This is another Type III addition for robustness.
  if (isNaN(valueX) || isNaN(valueY) || isNaN(valueZ) ||
      valueX < 0 || valueY < 0 || valueZ < 0) {
    console.error("Input validation error: All input values must be valid non-negative numbers.");
    return;
  }

  // Step 5: Evaluate the core condition.
  // The original condition: Math.sqrt(c) > Math.sqrt(a) + Math.sqrt(b)
  // This can be algebraically transformed to avoid multiple square root calculations and potential floating-point issues
  // with direct comparison, especially when numbers are very close.
  // Transformation:
  // 1. sqrt(Z) > sqrt(X) + sqrt(Y)
  // 2. If sqrt(X) + sqrt(Y) is negative, the original condition is trivially true (not possible here as X,Y >= 0).
  // 3. Since both sides are non-negative, we can square both:
  //    Z > (sqrt(X) + sqrt(Y))^2
  //    Z > X + Y + 2 * sqrt(X * Y)
  // 4. Rearrange:
  //    Z - X - Y > 2 * sqrt(X * Y)

  // Introduce an intermediate variable for the left side of the transformed inequality.
  let leftSideExpression = valueZ - valueX - valueY;

  // Initialize a flag to store the comparison result.
  let finalOutcomeFlag = false;

  // Type III change: Conditional logic based on the sign of leftSideExpression.
  // If leftSideExpression is negative, it cannot be greater than 2 * sqrt(X * Y) (which is always non-negative).
  if (leftSideExpression < 0) {
    finalOutcomeFlag = false; // The condition cannot be met.
  } else {
    // If leftSideExpression is non-negative, we can safely square both sides
    // of `leftSideExpression > 2 * sqrt(X * Y)` without changing the inequality direction.
    // (Z - X - Y)^2 > (2 * sqrt(X * Y))^2
    // (Z - X - Y)^2 > 4 * X * Y

    let squaredLeftSide = leftSideExpression * leftSideExpression;
    let fourTimesProductXY = 4 * valueX * valueY; // Helper variable for the right side.

    // Perform the final comparison.
    if (squaredLeftSide > fourTimesProductXY) {
      finalOutcomeFlag = true;
    } else {
      finalOutcomeFlag = false;
    }
  }

  // Step 6: Output the result based on the final flag.
  if (finalOutcomeFlag) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// Below this line: Standard input/output handling.
// This section is typically provided by the execution environment and should not be modified
// beyond calling the main processing function with the correct argument.
// Wrapped in an Immediately Invoked Function Expression (IIFE) for scope isolation (Type III change).
(function() {
  // Explicitly reference the 'fs' module and standard I/O paths.
  const fileSystemModule = require("fs");
  const standardInputFilePath = "/dev/stdin";
  const standardEncoding = "utf8";

  // Read all data from the standard input stream.
  const fullInputContent = fileSystemModule.readFileSync(standardInputFilePath, standardEncoding);

  // Invoke the main processing logic with the retrieved content.
  processInputData(fullInputContent);
})();