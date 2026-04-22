// This JavaScript module performs a specific calculation based on a numeric input string.
// It determines the execution environment (Node.js or browser) and processes accordingly.

function CalculateWeightedSum(sourceText) {
  // Break down the input string into individual number strings.
  let stringParts = sourceText.split(" ");

  // Convert each part to an integer, then sort them in ascending order,
  // and finally reverse the array to get numbers in descending order.
  const numericValues = stringParts.map(val => ~~val).sort().reverse();

  // Compute the result using the first three largest numbers in a specific weighted sum.
  return numericValues[0] * 10 + numericValues[1] + numericValues[2];
}

/*
 * The following block is an Immediately Invoked Function Expression (IIFE).
 * It handles the primary execution logic for the program,
 * distinguishing between a Node.js environment and a simulated browser environment.
 */
((initialRawInput, computedResult, resultKind) => {
  if (typeof require !== "undefined") {
    // This path is taken when running in a Node.js environment.
    const fileSystemModule = require("fs");
    const inputFilePath = "/dev/stdin";
    const textEncoding = "utf8";
    const fileContents = fileSystemModule.readFileSync(inputFilePath, textEncoding);
    console.log(CalculateWeightedSum(fileContents));
  } else {
    // This branch executes in a browser-like environment for demonstration purposes.
    // It processes the embedded string literal as if it were user input.
    initialRawInput = initialRawInput.split("\n").slice(1, -1).join("\n");

    // Attempt to compute the result, catching any potential errors.
    computedResult = (() => {
      try {
        return CalculateWeightedSum(initialRawInput);
      } catch (exceptionObject) {
        // If an error occurs, return its stack trace or message.
        return exceptionObject.stack || exceptionObject.message;
      }
    })();

    resultKind = typeof computedResult;

    // Ensure the `computedResult` is a string for display, converting objects to JSON if necessary.
    if (resultKind === "string" || (computedResult = JSON.stringify(computedResult))) {
      // Utilize jQuery to dynamically create and append HTML elements to the document body.
      // This displays the initial input, the type of the result, and the final computed value.
      $("<form>")
        .append(
          [
            [10, initialRawInput],
            0,
            [1, resultKind],
            0,
            [10, computedResult]
          ].map(
            // Iterate through configuration arrays to generate either <textarea> or <br> elements.
            (elementConfiguration) => {
              return $(
                elementConfiguration ? "<textarea>" : "<br>",
                elementConfiguration && {
                  rows: elementConfiguration[0],
                  cols: 40,
                  text: elementConfiguration[1]
                }
              );
            }
          )
        )
        .appendTo("body");
    }
  }
})(`
5 2 1
`);