'use strict'; /* This directive enforces stricter parsing and error handling. */

// A function designed to process an incoming data payload.
const processData = rawPayload => {
  // Break down the entire input string into an array of individual line segments.
  const lineSegments = rawPayload.split('\n');

  // The very first line segment provides the numerical count for subsequent operations.
  const iterationCount = lineSegments[0];

  // The second line segment is further divided into distinct string components, delimited by spaces.
  const stringComponents = lineSegments[1].split(' ');

  // Extract the initial string component for our first operand.
  const firstOperand = stringComponents[0];

  // Obtain the subsequent string component to serve as our second operand.
  const secondOperand = stringComponents[1];

  let finalResult = ''; // Initialize an empty string variable to accumulate the combined characters.

  // Commence a loop that executes 'iterationCount' times, combining characters from both strings.
  for (let charIndex = 0; charIndex < iterationCount; ++charIndex) {
    // Concatenate the character from 'firstOperand' at the current 'charIndex'
    // with the character from 'secondOperand' at the same 'charIndex',
    // and append this pair to the 'finalResult' string.
    finalResult += firstOperand.charAt(charIndex) + secondOperand.charAt(charIndex);
  }

  // Output the complete, interwoven string to the standard console.
  console.log(finalResult);
};

// Retrieve data from the standard input stream (e.g., '/dev/stdin' in Unix-like systems)
// and then invoke the 'processData' function with the read content, ensuring UTF-8 encoding.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));