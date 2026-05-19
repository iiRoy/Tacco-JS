const NEWLINE_CHAR = "\n";
const SPACE_DELIMITER = " ";
const EMPTY_STR = "";

/**
 * Processes an input string containing two hexadecimal numbers
 * and compares them, returning a string indicating the result.
 * @param {string} rawInput The input string, e.g., "A B".
 * @returns {string} ">" if the first number is greater,
 *                   "<" if the second number is greater,
 *                   "=" if they are equal.
 */
function ProcessInput(rawInput) {
  // Split the entire input by newlines, then each line by spaces,
  // and flatten the resulting array of arrays into a single array of strings.
  let processedTokens = [].concat(...rawInput.split(NEWLINE_CHAR).map(segment => segment.split(SPACE_DELIMITER)));

  // Helper function to get the next string token from the array.
  const extractStringToken = () => processedTokens.shift();
  // Helper function to get the next integer token (unused in this specific logic, but kept for structural similarity).
  const extractNumericToken = () => ~~processedTokens.shift();

  // Parse the first hexadecimal value.
  let firstHexValue = parseInt(extractStringToken(), 16);
  // Parse the second hexadecimal value.
  let secondHexValue = parseInt(extractStringToken(), 16);

  // Compare the two parsed values and return the appropriate symbol.
  if (firstHexValue > secondHexValue) {
    return ">";
  }
  if (firstHexValue === secondHexValue) {
    return "=";
  }
  // If neither of the above conditions is met, the first value must be less than the second.
  if (firstHexValue < secondHexValue) {
    return "<";
  }
}

// This section handles environment-specific execution (Node.js vs. browser).
// It's designed to run the main logic and display results.
((initialData, operationResult, resultType) => {
  if (typeof require !== "undefined") {
    // Node.js environment: read from stdin and print to console.
    console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // Browser environment: simulate input and display output in a textarea.
    initialData = initialData.split("\n").slice(1, -1).join("\n");
    operationResult = (function() {
      try {
        return ProcessInput(initialData);
      } catch (errorObject) {
        return errorObject.stack || errorObject.message;
      }
    })();
    resultType = typeof operationResult;
    if (resultType !== "string") {
      operationResult = JSON.stringify(operationResult);
    }
    // Append results to the document body using jQuery-like syntax.
    $("<form>").append(
      [
        [10, initialData],
        0,
        [1, resultType],
        0,
        [10, operationResult]
      ].map(elementConfig =>
        $(
          elementConfig ? "<textarea>" : "<br>",
          elementConfig && {
            rows: elementConfig[0],
            cols: 40,
            text: elementConfig[1]
          }
        )
      )
    ).appendTo("body");
  }
})(`
A B
`);
