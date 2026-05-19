function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get an array of lines.
  let processedLines = rawData.split("\n");

  // Parse the first line to extract numerical parameters.
  // The first line is expected to contain three space-separated integers.
  let firstLineParts = processedLines[0].split(" ");

  // 'factorR' is the first integer from the first line.
  const factorR = parseInt(firstLineParts[0], 10);
  // 'offsetD' is the second integer from the first line.
  const offsetD = parseInt(firstLineParts[1], 10);
  // 'initialX' is the third integer from the first line.
  const initialX = parseInt(firstLineParts[2], 10);

  // Initialize an array to store the sequence of results.
  // The problem implies a sequence of 10 elements.
  const resultSequence = new Array(10);

  // Calculate the first element of the sequence.
  // The formula is x * r - D.
  resultSequence[0] = initialX * factorR - offsetD;

  // Iterate to calculate the remaining elements of the sequence.
  // Each subsequent element depends on the previous one.
  for (let idx = 1; idx < 10; idx++) {
    // Apply the recurrence relation: current_x = previous_x * r - D.
    resultSequence[idx] = resultSequence[idx - 1] * factorR - offsetD;
  }

  // Join the calculated sequence elements into a single string,
  // with each element separated by a newline character.
  const finalOutput = resultSequence.join("\n");

  // Print the final output string to the console.
  // Using '%s' for string formatting, though not strictly necessary for a single string.
  console.log('%s', finalOutput);

  // Return the generated output string.
  return finalOutput;
}

// This 'testFunction' is likely for a web-based testing environment,
// not directly used in the Node.js execution path below.
function testFunction(testCaseNum) {
  // Retrieve input data from a DOM element based on the test case number.
  const testInputData = document.getElementById("input" + testCaseNum).value;
  // Call the main processing function with the retrieved input.
  const computedResult = ProcessInput(testInputData);

  // Initialize the outcome as "Wrong Answer".
  let testOutcome = "WA";
  // Compare the computed result with the expected output from another DOM element.
  // Only the first line of the expected output is considered for comparison.
  if (computedResult === document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    // If they match, set the outcome to "Accepted".
    testOutcome = "AC";
  }
  // Update the inner HTML of a result display element with the test outcome.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main processing function using input read from standard input.
// This part is specific to a Node.js environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
