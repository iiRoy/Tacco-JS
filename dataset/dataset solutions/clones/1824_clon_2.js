/*
 * This module contains a primary function for processing structured text data
 * and a utility for validating its output in a testing environment.
 */

// Function to process raw input and compute a specific numerical result.
function ProcessInputData(rawData) {
  // First, segment the entire raw data string into an array of individual line strings.
  let lineFragments = rawData.split("\n");

  // The very first line contains the total count of subsequent data records.
  const recordCount = parseInt(lineFragments[0], 10);

  // Remove the count line from the array, as it has served its purpose.
  lineFragments.shift();

  // Ensure the array only contains the actual data records, trimming any excess lines.
  lineFragments.splice(recordCount, lineFragments.length);

  // Map each record to its first numerical component, parse as integer, and sort in ascending order.
  let firstValues = lineFragments
    .map(itemString => parseInt(itemString.split(" ")[0], 10))
    .sort((a, b) => a - b);

  // Map each record to its second numerical component, parse as integer, sort ascending, then reverse.
  let secondValues = lineFragments
    .map(itemString => parseInt(itemString.split(" ")[1], 10))
    .sort((a, b) => a - b)
    .reverse();

  // Variable to store the final calculated numerical outcome.
  let finalResult;

  // Determine the calculation logic based on whether the record count is even or odd.
  if (recordCount % 2 === 0) {
    // If the count is even, calculate using the two middle elements, with specific arithmetic.
    finalResult = (secondValues[recordCount / 2 - 1] - firstValues[recordCount / 2 - 1]) * 2 - 1;
  } else {
    // If the count is odd, calculate using the single middle element, with different arithmetic.
    finalResult = (secondValues[Math.floor(recordCount / 2)] - firstValues[Math.floor(recordCount / 2)]) + 1;
  }

  // Display the final computed result to the standard output.
  console.log('%s', finalResult);

  // Return the calculated value for further use or testing.
  return finalResult;
}


// Auxiliary function designed for validating the correctness of the main logic
// within a simulated web environment, typically for testing specific cases.
function TestRunner(testCaseIndex) {
  // Fetch the input data for the current test case from a designated HTML element.
  const testInputString = document.getElementById("input" + testCaseIndex).value;

  // Execute the primary processing function with the retrieved test input.
  let computedAnswer = ProcessInputData(testInputString);

  // Initialize the result status for the test case as 'Wrong Answer'.
  let testOutcome = "WA";

  // Compare the computed answer against the expected output, obtained from another HTML element.
  if (computedAnswer === parseInt(document.getElementById("output" + testCaseIndex).value.split("\n")[0], 10)) {
    // If the computed answer matches the expected one, update the status to 'Accepted'.
    testOutcome = "AC";
  }

  // Update the HTML element corresponding to the test case result with the determined outcome.
  document.getElementById("result" + testCaseIndex).innerHTML = testOutcome;
}


// Entry point: Read data from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));