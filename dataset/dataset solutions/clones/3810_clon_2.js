/*
 * This JavaScript module is designed to process a single line of input data.
 * It expects the input to be space-separated values, including numbers and a string.
 * The core logic involves parsing these components and performing a conditional
 * arithmetic calculation based on the parity of the last digit of a specific string segment.
 */
function ProcessInputData(incomingString) {
  // Split the entire input string into an array of smaller string fragments.
  // The splitting occurs at each space character encountered.
  let stringFragments = incomingString.split(" ");

  // Convert the first three string fragments into numerical values.
  // These are expected to represent numerical data points.
  // Note: 'numericalValueC' is parsed but not utilized in the final computation,
  // mirroring the behavior of its counterpart in the original code structure.
  let numericalValueA = Number(stringFragments[0]);
  let numericalValueB = Number(stringFragments[1]);
  let numericalValueC = Number(stringFragments[2]);

  // Store the fourth string fragment. This segment is treated as a string
  // from which a specific character will be extracted.
  let fourthTextSegment = stringFragments[3];

  // Extract the last character from 'fourthTextSegment' and convert it to an integer.
  // This integer's odd/even status will determine the subsequent operation.
  let finalCharacterAsNumber = Number.parseInt(
    fourthTextSegment[fourthTextSegment.length - 1]
  );

  // Perform a conditional subtraction based on whether 'finalCharacterAsNumber' is even or odd.
  // If it's even, subtract 'numericalValueB' from 'numericalValueA'.
  // If it's odd, subtract 'numericalValueA' from 'numericalValueB'.
  // The result of this operation is then printed to the standard output.
  console.log(
    finalCharacterAsNumber % 2 === 0
      ? numericalValueA - numericalValueB
      : numericalValueB - numericalValueA
  );
}

// --- Execution Entry Point ---
// This block initializes the process by reading input from a specified source
// and then invoking the primary data processing function.
// It uses Node.js's file system module to read synchronous input.
const fileSystemUtility = require("node:fs");
const initialInputContent = fileSystemUtility.readFileSync("/proc/self/fd/0", "utf-8"); // Reads from standard input on Unix-like systems
ProcessInputData(initialInputContent);