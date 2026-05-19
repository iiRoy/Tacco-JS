function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let parsedLines = rawData.split('\n');

  // Parse the first line to get the number of elements.
  const numElements = parseInt(parsedLines[0], 10);

  // Parse the second line for height values.
  const heightsArr = parsedLines[1].split(' ').map(val => parseInt(val, 10));

  // Parse the third line for associated values.
  const valuesArr = parsedLines[2].split(' ').map(item => parseInt(item, 10));

  // Initialize a dynamic programming array with zeros.
  let dynamicProgression = new Array(numElements + 1).fill(0);

  // This line was commented out in the original, so it remains commented.
  // dynamicProgression[heightsArr[0]] = valuesArr[0];

  // Initialize the variable to store the maximum result.
  let finalResult = 0;

  // Iterate through each element to build up the DP table.
  for (let idx = 0; idx < numElements; idx++) {
    // This variable is declared but not used in the original logic.
    let currentMax = 0;

    // Calculate the temporary sum for the current height.
    const tempSum = valuesArr[idx] + dynamicProgression[heightsArr[idx]];

    // Update DP values from the current height upwards.
    for (let innerIdx = heightsArr[idx]; innerIdx < numElements + 1; innerIdx++) {
      // If the temporary sum is greater, update the DP table.
      if (tempSum > dynamicProgression[innerIdx]) {
        dynamicProgression[innerIdx] = tempSum;
      } else {
        // If not greater, we can stop as values are non-decreasing.
        break;
      }
    }
    // Update the overall maximum result.
    finalResult = Math.max(finalResult, dynamicProgression[heightsArr[idx]]);
  }

  // Output the final computed result.
  console.log('%s', finalResult);

  // Return the final result.
  return finalResult;
}

// Helper function for debugging purposes, typically called when a "Run" button is pressed in a UI.
function testSolution(testCaseNum) {
  // Retrieve input data from a specific DOM element.
  const testInputData = document.getElementById("input" + testCaseNum).value;

  // Execute the main processing function with the retrieved input.
  const computedAnswer = ProcessInput(testInputData);

  // Initialize the test outcome as "Wrong Answer".
  let testOutcome = "WA";

  // Compare the computed answer with the expected output from another DOM element.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    // If they match, set the outcome to "Accepted".
    testOutcome = "AC";
  }

  // Display the test outcome in a designated result element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
