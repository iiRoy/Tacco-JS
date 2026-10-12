function ProcessData(rawData) {
  // Split the incoming raw data string into an array of individual lines.
  let processedLines = rawData.split("\n");

  // Parse the first line to extract the total count of items, ensuring base-10 interpretation.
  const itemCount = parseInt(processedLines[0], 10);

  // Remove the first element (which was the item count) from the array of lines.
  processedLines.shift();

  // Adjust the array to contain only the relevant 'itemCount' lines, removing any excess.
  // This operation removes elements from 'itemCount' index up to the end of the array.
  processedLines.splice(itemCount, processedLines.length);

  // Process each line to extract the first numerical value, parse it, and then sort these values in ascending order.
  const firstValues = processedLines.map(entryLine => parseInt(entryLine.split(" ")[0], 10)).sort((a, b) => a - b);

  // Process each line to extract the second numerical value, parse it, sort in ascending order, and then reverse to get descending order.
  const secondValues = processedLines.map(entryLine => parseInt(entryLine.split(" ")[1], 10)).sort((a, b) => a - b).reverse();

  let finalResult; // Variable to store the calculated final outcome.

  // Determine the calculation logic based on whether the item count is even or odd.
  if (itemCount % 2 === 0) {
    // If the item count is even, calculate using elements around the middle.
    // The index (itemCount / 2 - 1) points to the upper-middle element in a zero-indexed array.
    finalResult = (secondValues[itemCount / 2 - 1] - firstValues[itemCount / 2 - 1]) * 2 - 1;
  } else {
    // If the item count is odd, calculate using the exact middle element.
    // Math.floor(itemCount / 2) gives the index of the middle element.
    finalResult = (secondValues[Math.floor(itemCount / 2)] - firstValues[Math.floor(itemCount / 2)]) + 1;
  }

  // Output the computed final result to the standard console.
  console.log('%s', finalResult);

  // Return the calculated result.
  return finalResult;
}

// This helper function is designed for testing the solution within a web browser environment.
function testSolution(testCaseIndex) {
  // Retrieve the input string for the specific test case from a designated HTML input element.
  const testInputString = document.getElementById("input" + testCaseIndex).value;

  // Execute the main data processing function with the retrieved test input.
  const computedAnswer = ProcessData(testInputString);

  let testOutcome = "WA"; // Initialize the test outcome as "Wrong Answer".

  // Compare the computed answer with the expected output, which is taken from the first line of a corresponding HTML output element.
  if (computedAnswer == document.getElementById("output" + testCaseIndex).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, set the outcome to "Accepted".
  }

  // Display the final test outcome in a specific HTML element.
  document.getElementById("result" + testCaseIndex).innerHTML = testOutcome;
}

// For execution in a Node.js environment, read input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
