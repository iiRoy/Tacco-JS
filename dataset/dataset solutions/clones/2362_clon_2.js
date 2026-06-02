"use strict";

// This function processes the provided raw input data.
function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  let dataRows = rawData.split('\n');

  // Extract the first numerical value from the initial line.
  // The `+` operator is used for type coercion to a number.
  let firstValue = +dataRows[0].split(' ')[0];

  // Extract the second numerical value from the subsequent line.
  let secondValue = +dataRows[1].split(' ')[0];

  // Output the logical negation of the strict equality comparison between the two values.
  console.log(!(firstValue === secondValue));
}

// Execute the primary processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
