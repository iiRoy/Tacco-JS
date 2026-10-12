'use strict';

// This function processes the incoming data stream.
function ProcessInput(rawData) {
  const segments = rawData.split(" "); // Split the raw input string by space.
  const firstVal = segments[0]; // Extract the first numerical component.
  const secondVal = segments[1]; // Extract the second numerical component.

  let finalOutcome; // Declare a variable to store the computed result.

  // Determine the final outcome based on the value of the second component.
  if (secondVal == 1) {
    finalOutcome = 0; // If the second component is 1, the result is 0.
  } else {
    finalOutcome = firstVal - secondVal; // Otherwise, subtract the second from the first.
  }

  console.log(finalOutcome); // Display the calculated outcome to the console.
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
