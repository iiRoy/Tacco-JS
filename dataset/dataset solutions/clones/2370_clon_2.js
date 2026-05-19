"use strict";

function ProcessInputData(incomingData) {
  // Calculate the number of hundreds and the remaining part
  let majorComponent = Math.floor(incomingData / 100);
  let minorRemainder = incomingData % 100;

  // The condition checks if the remainder can be "covered" by the major component
  // (each hundred can cover up to 5 units of the remainder)
  if (minorRemainder <= majorComponent * 5) {
    console.log(1); // Output 1 if the condition is met
  } else {
    console.log(0); // Output 0 otherwise
  }
}

// Read input from standard input and pass it to the processing function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
