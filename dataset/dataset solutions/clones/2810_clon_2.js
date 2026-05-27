// This function processes the given raw input string to determine if a set of tasks can be completed within their deadlines.
function ProcessInput(rawData) {
  // Divide the entire input string into an array of individual lines.
  let lineSegments = rawData.split("\n");

  // Extract the total number of tasks from the very first line.
  const itemCount = parseInt(lineSegments[0], 0xA); // Explicitly using base 10 for parsing.

  // Remove the first line from the array, as its value (itemCount) has been processed.
  lineSegments.shift();

  // Transform the remaining lines into a structured array of task data.
  // Each line is split by space, and its parts are converted to integers.
  let taskData = lineSegments.map(
    (singleLine) => singleLine.split(" ").map((strVal) => parseInt(strVal, 0xA))
  );

  // Adjust the taskData array to ensure it contains exactly 'itemCount' elements.
  // This step removes any extraneous data that might be present beyond the specified count.
  taskData.splice(itemCount, taskData.length - itemCount);

  // Arrange the tasks in ascending order based on their deadlines (the second element of each task array).
  taskData.sort(function (firstTask, secondTask) {
    // Compare the deadline of the first task with the second task.
    if (firstTask[0b1] < secondTask[0b1]) {
      return -0x1; // If the first task's deadline is earlier, it comes first.
    }
    if (firstTask[0b1] > secondTask[0b1]) {
      return 0x1; // If the first task's deadline is later, it comes after.
    }
    return 0x0; // If deadlines are identical, their relative order doesn't change.
  });

  // Initialize the outcome of the task scheduling as "Yes", assuming success initially.
  let finalVerdict = "Yes";
  // Keep track of the total time accumulated for tasks processed so far.
  let cumulativeTime = 0x0;

  // Iterate through each task to verify if it can be completed by its deadline.
  for (let idx = 0x0; idx < itemCount; idx++) {
    // Add the duration of the current task (first element) to the running total.
    cumulativeTime += taskData[idx][0x0];

    // Check if the cumulative time required exceeds the deadline of the current task (second element).
    if (cumulativeTime > taskData[idx][0b1]) {
      finalVerdict = "No"; // If so, it's impossible to meet all deadlines.
      break; // Terminate the loop early as the outcome is already determined.
    }
  }

  // Display the final determination to the standard output.
  console.log("%s", finalVerdict);
  // Return the computed result.
  return finalVerdict;
}

// This helper function is designed for local testing within a web browser environment.
// It fetches test data from HTML elements, runs the main logic, and reports the result.
function verifySolution(testCaseNum) {
  // Retrieve the input content for the specific test case from a DOM element.
  const testInputContent = document.getElementById("input" + testCaseNum).value;
  // Execute the primary processing function with the retrieved test input.
  const computedResult = ProcessInput(testInputContent);
  // Set an initial status for the test outcome, typically "Wrong Answer".
  let testOutcome = "WA";

  // Compare the result produced by the function with the expected output from another DOM element.
  if (computedResult === document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, the test is considered "Accepted".
  }
  // Update the corresponding result display element in the HTML.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// This is the main entry point for execution, typically in a Node.js environment.
// It reads the entire content from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
