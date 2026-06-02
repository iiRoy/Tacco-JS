// This function serves as the primary entry point for data processing.
function ProcessInputData(incomingString) {
  // The input string is first broken down into an array of individual characters.
  // This step prepares the data for subsequent numerical parsing.
  incomingString = incomingString.split("");

  // Initialize three distinct numerical variables by parsing characters
  // from the processed input array. The radix 10 is used for decimal conversion.
  let valueA = parseInt(incomingString[0], 10);
  let valueB = parseInt(incomingString[1], 10);
  let valueC = parseInt(incomingString[2], 10);

  // Reassign 'valueA' using a different element from the input array.
  valueA = parseInt(incomingString[1], 10);

  // Reassign 'valueB' using another element from the input array.
  valueB = parseInt(incomingString[0], 10);

  // Perform a further reassignment for 'valueA' with a new input element.
  valueA = parseInt(incomingString[2], 10);

  // Conclude the reassignments by updating 'valueC'.
  valueC = parseInt(incomingString[1], 10);

  // Output the final states of the three variables to the console.
  // The '%d' format specifier ensures integer representation.
  console.log('%d', valueA, valueB, valueC);
}

// Execute the main processing function by reading data from standard input.
// The 'fs' module is utilized to synchronously read the entire content
// of '/dev/stdin' as a UTF-8 encoded string, which then becomes the input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
