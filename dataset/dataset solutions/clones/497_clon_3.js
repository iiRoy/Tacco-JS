// This script processes quaternion multiplication problems from standard input.
// It expects the first line to be the number of test cases, followed by lines
// each containing eight space-separated numbers representing two quaternions.
// A '0' on a line can serve as a sentinel to stop processing early.

// Core Node.js module for interacting with the file system.
const fileSystem = require('fs');

// Read the entire standard input into a string.
// It's assumed that the input will be UTF-8 encoded.
let rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Prepare the input data for processing:
// 1. Remove any leading or trailing whitespace from the full input string.
// 2. Split the cleaned string into an array of individual lines.
let processedLines = rawInputData.trim().split('\n');

// The very first line of the input is expected to be the total count
// of test cases that follow. We parse it as an integer.
let totalTestCases = parseInt(processedLines.shift(), 10);

// Basic validation for the number of test cases.
// If it's not a valid positive number, we might issue a warning.
if (isNaN(totalTestCases) || totalTestCases <= 0) {
  // In a production system, one might throw an error or handle this more robustly.
  // For this exercise, we'll allow the loop to potentially run zero times
  // or handle empty lines if `totalTestCases` is invalid.
}

// Initialize a counter to track the current test case being processed.
let currentCaseIndex = 0;

// Loop through each test case until all specified cases are processed
// or a sentinel value is encountered.
while (currentCaseIndex < totalTestCases) {
  // Retrieve the next line from the processed input array.
  // `shift()` removes the first element and returns it.
  let currentInputLine = processedLines.shift();

  // Check for sentinel value ('0') or if there are no more lines.
  // If either condition is met, terminate the loop.
  if (currentInputLine === undefined || currentInputLine === '0') {
    break; // Exit the processing loop.
  }

  // Parse the numeric values from the current line.
  // The line is split by spaces, and each part is converted to a Number.
  const numericComponents = currentInputLine.split(' ').map(Number);

  // Validate the parsed components:
  // Ensure we have exactly 8 numbers (4 for each quaternion) and none are NaN.
  if (numericComponents.length !== 8 || numericComponents.some(isNaN)) {
    // If the line is malformed, log a warning and proceed to the next case.
    // console.warn(`Warning: Skipping malformed input line for case ${currentCaseIndex + 1}: "${currentInputLine}"`);
    currentCaseIndex++; // Increment case index even for skipped cases.
    continue; // Skip to the next iteration of the loop.
  }

  // Deconstruct the array of numbers into two distinct quaternion objects.
  // Each quaternion has a scalar (real) part and three imaginary parts (i, j, k).
  const quaternionOne = {
    s: numericComponents[0], // Scalar part of the first quaternion
    i: numericComponents[1], // 'i' component of the first quaternion
    j: numericComponents[2], // 'j' component of the first quaternion
    k: numericComponents[3]  // 'k' component of the first quaternion
  };

  const quaternionTwo = {
    s: numericComponents[4], // Scalar part of the second quaternion
    i: numericComponents[5], // 'i' component of the second quaternion
    j: numericComponents[6], // 'j' component of the second quaternion
    k: numericComponents[7]  // 'k' component of the second quaternion
  };

  // --- Core Logic: Quaternion Multiplication ---
  // Given two quaternions Q1 = (s1 + i1*i + j1*j + k1*k) and Q2 = (s2 + i2*i + j2*j + k2*k),
  // their product Q_res = Q1 * Q2 = (s_res + i_res*i + j_res*j + k_res*k) is calculated as follows:

  // Calculate the scalar (real) component of the resulting quaternion.
  const productScalar = (quaternionOne.s * quaternionTwo.s) -
                        (quaternionOne.i * quaternionTwo.i) -
                        (quaternionOne.j * quaternionTwo.j) -
                        (quaternionOne.k * quaternionTwo.k);

  // Calculate the 'i' component of the resulting quaternion.
  const productI = (quaternionOne.s * quaternionTwo.i) +
                   (quaternionOne.i * quaternionTwo.s) +
                   (quaternionOne.j * quaternionTwo.k) -
                   (quaternionOne.k * quaternionTwo.j);

  // Calculate the 'j' component of the resulting quaternion.
  const productJ = (quaternionOne.s * quaternionTwo.j) -
                   (quaternionOne.i * quaternionTwo.k) +
                   (quaternionOne.j * quaternionTwo.s) +
                   (quaternionOne.k * quaternionTwo.i);

  // Calculate the 'k' component of the resulting quaternion.
  const productK = (quaternionOne.s * quaternionTwo.k) +
                   (quaternionOne.i * quaternionTwo.j) -
                   (quaternionOne.j * quaternionTwo.i) +
                   (quaternionOne.k * quaternionTwo.s);

  // Output the components of the resultant quaternion, space-separated.
  // For example: "productScalar productI productJ productK"
  console.log(`${productScalar} ${productI} ${productJ} ${productK}`);

  // Advance the counter to the next test case.
  currentCaseIndex++;
}

// End of script execution.