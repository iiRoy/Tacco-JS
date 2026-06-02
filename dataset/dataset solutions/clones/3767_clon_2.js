const LINE_BREAK_CHAR = "\n";
const SPACE_CHAR = " ";
const EMPTY_STRING_VAL = ""; // This constant is not used in the original logic, but is part of the initial declarations.

/**
 * Computes a specific numerical value based on two input integers.
 * This function processes raw string input, extracts numbers, and performs a calculation.
 * @param {string} rawData - The raw input string containing numbers.
 * @returns {number} The calculated result.
 */
function CalculateValue(rawData) {
  // Process the input string: trim, split by line breaks, then split each line by spaces,
  // and flatten the resulting array of arrays into a single array of string tokens.
  let processedData = [].concat(...rawData.trim().split(LINE_BREAK_CHAR).map(lineSegment => lineSegment.split(SPACE_CHAR)));

  // Helper function to get the next string token from the processed data.
  const extractString = () => processedData.shift();
  // Helper function to get the next integer token from the processed data.
  const extractInteger = () => ~~processedData.shift(); // Using bitwise NOT for integer conversion.

  // Extract the first two integer values from the processed input.
  var firstNum = extractInteger();
  var secondNum = extractInteger();

  // Calculate the difference between the second and first number.
  var differenceVal = secondNum - firstNum;

  // Apply the core calculation: sum of integers from 1 to differenceVal, minus the second number.
  // The sum of integers from 1 to N is N * (N + 1) / 2.
  return differenceVal * (differenceVal + 1) / 2 - secondNum;
}

// This section handles the execution environment, either Node.js or a browser.
// It's a self-executing anonymous function that provides input and displays output.
((inputContent, resultOutput, resultType) => {
  // Check if 'require' is defined, indicating a Node.js environment.
  if (typeof require !== "undefined") {
    // In Node.js, read input from stdin, pass to CalculateValue, and print the result to console.
    console.log(CalculateValue(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    // In a browser environment, simulate input and display results in a simple HTML structure.
    // The inputContent is processed to remove leading/trailing newlines from the template literal.
    inputContent = inputContent.split("\n").slice(1, -1).join("\n");

    // Attempt to execute the main calculation function.
    resultOutput = (function() {
      try {
        return CalculateValue(inputContent);
      } catch (errorObject) {
        return errorObject.stack || errorObject.message; // Return error details if an exception occurs.
      }
    })();

    // Determine the type of the result.
    resultType = typeof resultOutput;

    // If the result is not a string, convert it to a JSON string for display.
    if (resultType !== "string") {
      resultOutput = JSON.stringify(resultOutput);
    }

    // Create a form element and append textareas/breaks to display input and output.
    // This uses jQuery, assuming it's available in the browser context.
    $("<form>")
      .append(
        [
          [10, inputContent], // Input content in a textarea with 10 rows.
          0, // A <br> tag.
          [1, resultType], // Result type in a textarea with 1 row.
          0, // Another <br> tag.
          [10, resultOutput] // Result output in a textarea with 10 rows.
        ].map(itemData =>
          $(
            itemData ? "<textarea>" : "<br>", // Create textarea or break based on itemData.
            itemData && { rows: itemData[0], cols: 40, text: itemData[1] } // Set attributes for textarea.
          )
        )
      )
      .appendTo("body"); // Add the form to the document body.
  }
})(`
54 65
`); // The initial input string for the browser environment.
