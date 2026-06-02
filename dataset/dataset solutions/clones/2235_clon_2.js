"use strict";

// This function processes a given input string to compute and display a result.
function ProcessInput(inputString) {
  // The input string is first divided into an array of lines based on newline characters.
  let lineSegments = inputString.split('\n');

  // The first segment is interpreted as a numerical value for the primary dimension.
  const primaryDimension = Number(lineSegments[0]);
  // The second segment is interpreted as a numerical value for the secondary dimension.
  const secondaryDimension = Number(lineSegments[1]);
  // The third segment is interpreted as a numerical value representing a total count.
  const overallCount = Number(lineSegments[2]);

  // A conditional check is performed comparing the primary and secondary dimensions.
  if (primaryDimension > secondaryDimension) {
    // If the primary dimension is larger, the ceiling of overallCount divided by primaryDimension is logged.
    console.log(Math.ceil(overallCount / primaryDimension));
  } else {
    // If the primary dimension is not larger (i.e., smaller or equal),
    // the exact same calculation and logging operation is performed.
    console.log(Math.ceil(overallCount / primaryDimension));
  }
}

// The program initiates by reading the entire content from standard input.
// The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
// The path "/dev/stdin" refers to standard input, and "utf8" specifies the encoding.
// The obtained content is then passed to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
