const ProcessInput = (rawData) => {
  // Divide the input stream by newline characters.
  rawData = rawData.split('\n');
  let charValue = rawData[0]; // Extract the first line, which contains the character.

  console.log(charValue.charCodeAt(0)); // Display the ASCII value of the initial character.

  const nextChar = String.fromCharCode(charValue.charCodeAt(0) + 1); /* Calculate the subsequent character by incrementing its ASCII code. */

  console.log('Output: %s', nextChar); // Present the derived character.
  return nextChar; // Return the computed character.
}


function TestExecution(testCaseIndex) {
  let testInput = document.getElementById('input' + testCaseIndex).value; /* Obtain the test input from the specified DOM element. */
  let computedResult = ProcessInput(testInput); // Invoke the primary processing function.
  let testOutcome = "FAIL"; // Initialize the test outcome as failure.
  if (computedResult === document.getElementById('output' + testCaseIndex).value.split('\n')[0]) { /* Compare the actual result with the expected output. */
    testOutcome = "PASS"; // Mark the test as successful if results match.
  }
  document.getElementById('result' + testCaseIndex).innerHTML = testOutcome; // Update the DOM with the final test status.
}

ProcessInput(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" })); // Execute the main logic using file system input in a Node.js environment.