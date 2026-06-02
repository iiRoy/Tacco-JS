const LINE_BREAK_CHAR = "\n"; // Represents a newline character for splitting input
const SPACE_DELIMITER = " "; // Represents a space character for splitting input
const EMPTY_STR = ""; // An empty string constant, not used in this version

/**
 * Processes input data to validate a hyphenated string against specified lengths.
 * @param {string} rawData The raw input string containing lengths and the hyphenated string.
 * @returns {string} "Yes" if the string matches the criteria, "No" otherwise.
 */
function ProcessInputData(rawData) {
  // First, parse the entire input string into an array of individual tokens.
  // It splits by newlines, then each line by spaces, and flattens the result.
  let tokenArray = [].concat(...rawData.split(LINE_BREAK_CHAR).map(linePart => linePart.split(SPACE_DELIMITER)));

  // Helper function to extract the next string token from the array.
  const getNextStringToken = () => tokenArray.shift();
  // Helper function to extract the next integer token from the array,
  // using bitwise NOT (~~) for efficient string-to-integer conversion.
  const getNextIntegerToken = () => ~~tokenArray.shift();

  // Retrieve the first expected length from the input.
  let firstLength = getNextIntegerToken();
  // Retrieve the second expected length from the input.
  let secondLength = getNextIntegerToken();

  // Get the hyphenated string and split it by the hyphen character.
  let hyphenatedStringParts = getNextStringToken().split("-");

  // Validate the structure of the hyphenated string.
  // It must contain exactly two parts after splitting by hyphen.
  if (hyphenatedStringParts.length !== 2) {
    return "No"; // If not two parts, it's invalid.
  }
  // Validate the length of the first part against the first expected length.
  if (hyphenatedStringParts[0].length !== firstLength) {
    return "No"; // If lengths don't match, it's invalid.
  }
  // Validate the length of the second part against the second expected length.
  if (hyphenatedStringParts[1].length !== secondLength) {
    return "No"; // If lengths don't match, it's invalid.
  }

  // If all validations pass, the string is valid.
  return "Yes";
}

// This section handles environment-specific input/output.
// It checks if 'require' is defined (Node.js environment) or falls back to browser-like simulation.
((inputStringForBrowser, processingResult, resultType) =>
  "undefined" !== typeof require
    ? console.log(ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8")))
    : [
        // Browser/other environment simulation:
        // Remove first and last newline, then join lines.
        (inputStringForBrowser = inputStringForBrowser.split("\n").slice(1, -1).join("\n")),
        // Attempt to process the input string.
        (processingResult = (function () {
          try {
            return ProcessInputData(inputStringForBrowser);
          } catch (errorObject) {
            return errorObject.stack || errorObject.message; // Return error details if processing fails.
          }
        })()),
        // Determine the type of the processing result.
        (resultType = typeof processingResult),
        // If the result is not a string, convert it to a JSON string.
        "string" === resultType || (processingResult = JSON.stringify(processingResult)),
        // Simulate appending elements to the body using a jQuery-like syntax.
        $("<form>")
          .append(
            [
              [10, inputStringForBrowser],
              0,
              [1, resultType],
              0,
              [10, processingResult],
            ].map(elementData =>
              $(
                elementData ? "<textarea>" : "<br>", // Create textarea for data, or br for spacing.
                elementData && {
                  rows: elementData[0],
                  cols: 40,
                  text: elementData[1],
                }
              )
            )
          )
          .appendTo("body"),
      ])(
  // Hardcoded input string for the browser/non-Node.js environment.
  `
3 4
269-66-0
`
);
