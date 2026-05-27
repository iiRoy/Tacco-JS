"use strict";

/*
 * This module processes incoming data based on specific conditions.
 * It demonstrates conditional logic and string comparisons.
 */
const ProcessInput = (rawData) => {
  // Split the raw input string into an array of lines,
  // after removing any leading/trailing whitespace from the whole input.
  let parsedLines = rawData.trim().split("\n");

  // Extract the first line as the primary numeric value.
  // Note: In JavaScript, comparison operators like >= will attempt type coercion.
  let firstValue = parsedLines[0];

  // Extract the second line as the secondary string value.
  let secondValue = parsedLines[1];

  // A debug line that was previously commented out.
  // console.log(parsedLines);

  // Evaluate the primary numeric value.
  if (firstValue >= 3200) {
    // If the primary value is 3200 or greater,
    // output the secondary string value directly.
    console.log(secondValue);
  } else if (firstValue < 3200) {
    // If the primary value is less than 3200,
    // perform a conditional swap based on the secondary string value.
    if (secondValue === "pink") {
      // If the secondary value is "pink", output "red".
      console.log("red");
    } else if (secondValue === "red") {
      // If the secondary value is "red", output "pink".
      console.log("pink");
    }
    // No action defined for other string values when firstValue < 3200.
  }
};

// Execute the main processing function by reading input from standard input.
// The input is read synchronously as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
