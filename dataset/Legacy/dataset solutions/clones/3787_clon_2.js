const NEWL = "\n"; // Newline character for formatting
const BLNK = " "; // Space character for separation
const EMPT = ""; // Empty string constant

/**
 * Computes the maximum possible result from basic arithmetic operations
 * on two input numbers.
 * @param {string} dataInput - A string containing two space-separated numbers.
 * @returns {number} The largest integer result.
 */
function ComputeMaxOperations(dataInput) {
  // Process the input string: trim whitespace, split by space, and convert to integers.
  let numericValues = dataInput.trim().split(BLNK).map(valStr => ~~valStr);

  // Extract the two operands.
  let firstOperand = numericValues[0];
  let secondOperand = numericValues[1];

  // Initialize the maximum value with a very small number.
  let currentMaximum = -1000000;

  // Calculate sum and update maximum.
  currentMaximum = Math.max(currentMaximum, firstOperand + secondOperand);
  // Calculate difference and update maximum.
  currentMaximum = Math.max(currentMaximum, firstOperand - secondOperand);
  // Calculate product and update maximum.
  currentMaximum = Math.max(currentMaximum, firstOperand * secondOperand);

  // Return the final maximum value as an integer.
  return parseInt(currentMaximum, 10);
}

// This section handles input/output based on the execution environment.
// It's designed to work both in a Node.js-like environment (reading from stdin)
// and potentially in a browser-like environment for demonstration purposes.
((rawContent, executionResult, resultType) => {
  // Check if 'require' is available (Node.js environment).
  if (typeof require !== "undefined") {
    // Read input from stdin, process it, and print the result to console.
    console.log(ComputeMaxOperations(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // Browser-like environment fallback (for demonstration/testing).
    // This part is typically for displaying the result in a web page.
    rawContent = rawContent.split(NEWL).slice(1, -1).join(NEWL); // Clean up input string.
    executionResult = (function() {
      try {
        return ComputeMaxOperations(rawContent); // Execute the main logic.
      } catch (error) {
        return error.stack || error.message; // Catch and display errors.
      }
    })();
    resultType = typeof executionResult; // Determine the type of the result.

    // If the result is not a string, convert it to JSON for display.
    if (resultType !== "string") {
      executionResult = JSON.stringify(executionResult);
    }

    // Append results to the body using jQuery-like syntax (assuming jQuery is loaded).
    // This creates a form with textareas to display input and output.
    $("<form>").append(
      [
        [10, rawContent], 0, [1, resultType], 0, [10, executionResult]
      ].map(itemConfig =>
        $(itemConfig ? "<textarea>" : "<br>", itemConfig && {
          rows: itemConfig[0],
          cols: 40,
          text: itemConfig[1]
        })
      )
    ).appendTo("body");
  }
})(`
-1000 1000
`); // The sample input data for browser environment.
