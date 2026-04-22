// Core function to process string data, perform calculation, and output result
function performMultiplicationAndLog(sourceText) {
  // Step 1: Normalize and parse the incoming string data.
  // Trim leading/trailing whitespace, then split by one or more spaces.
  // The filter(Boolean) removes any empty strings that might result from
  // multiple spaces between numbers or leading/trailing spaces.
  const parsedSegments = sourceText.trim().split(/\s+/).filter(Boolean);

  // Type III: Add a guard clause for input validation.
  // Ensure exactly two numerical components are provided.
  if (parsedSegments.length !== 2) {
    // Use stderr for error messages as a structural change from console.log.
    process.stderr.write("Error: Expected two numeric values separated by space. Received: '" + sourceText + "'\n");
    return; // Exit if input format is incorrect.
  }

  // Type III: Introduce explicit type conversion and helper variables.
  const primaryOperand = parseFloat(parsedSegments[0]);
  const secondaryOperand = parseFloat(parsedSegments[1]);

  // Type III: Add validation for successful number parsing.
  if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
    process.stderr.write("Error: Invalid numeric input detected. Please provide valid numbers. Received: '" + parsedSegments.join(" ") + "'\n");
    return; // Exit if parsing failed for either operand.
  }

  // Type III: Introduce an intermediate variable for the calculation result.
  const finalProduct = primaryOperand * secondaryOperand;

  // Step 2: Output the computed product.
  // Using process.stdout.write for direct stream interaction,
  // explicitly adding a newline character. This is a rewrite of console.log.
  process.stdout.write(String(finalProduct) + '\n');
}

// Type III: Encapsulate the program's execution flow within an IIFE (Immediately Invoked Function Expression).
// This provides a distinct execution context and separates setup from core logic.
(function programExecutionModule() {
  // Type III: Introduce a helper variable for the 'fs' module.
  const fileSystemUtility = require('fs');

  // Type III: Introduce a helper variable to hold the raw content read from stdin.
  // Reads the entire content from standard input synchronously.
  const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main processing function with the acquired input.
  performMultiplicationAndLog(rawInputContent);
})();