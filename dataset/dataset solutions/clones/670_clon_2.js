let numItems; // Variable to store the total count of items.

const taskData = []; // An array to hold task-related information.

function processTasks() {
  // The primary function orchestrating the task scheduling logic.

  while ((numItems = readInputToken())) {
    // Continuously process sets of tasks until no more input is available.

    iterateRange(numItems, function (idx) {
      // Populate the task data array with two numeric values for each task.
      taskData[idx] = [readInputToken(), readInputToken()];
    });

    taskData.sort(function (taskA, taskB) {
      // Sort the tasks based on their second attribute (e.g., deadline) in ascending order.
      return taskA[1] - taskB[1];
    });

    // console.log(taskData); // A commented-out line for debugging purposes.

    let isFeasible = !false; // A boolean flag indicating if the current schedule is possible.
    let currentLoad = 0; // Accumulator for the total workload at any given point.

    iterateRange(numItems, function (idx) {
      // Iterate through the sorted tasks to check feasibility.
      currentLoad += taskData[idx][0]; // Add the first attribute (e.g., duration) of the current task to the load.
      isFeasible = currentLoad <= taskData[idx][1] && isFeasible; // Update feasibility based on whether the load exceeds the task's second attribute (e.g., deadline).
    });

    outputResult(isFeasible ? "Yes" : "No"); // Print the final determination of feasibility.
  }
}

function iterateRange(startVal, endVal, callbackFn) {
  // A flexible utility function for looping, similar to Python's range.
  if (callbackFn === void 0) {
    // If the third argument is not provided, assume a 0-based range.
    callbackFn = endVal;
    endVal = startVal;
    startVal = 0;
  }
  for (let loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
    // Execute the callback function for each number in the range.
    if (callbackFn(loopCounter) === false) {
      // If the callback explicitly returns false, terminate the loop early.
      break;
    }
  }
}

process.stdin.resume(); // Ensures the Node.js process stays active to receive input.
process.stdin.setEncoding("utf8"); // Configures the input stream to interpret data as UTF-8 text.

let rawData = ""; // A string buffer to collect all incoming standard input.
let dataPointer = 0; // An index to keep track of the current position in the processed input tokens.

function readInputToken(dataType) {
  // Function to extract and parse the next token from the input stream.
  if (dataType === "string") {
    // If a string type is requested, return the token as is.
    return rawData[dataPointer++];
  } else {
    // Otherwise, attempt to convert the token to a number.
    return +rawData[dataPointer++];
  }
}

function outputResult(valueToPrint) {
  // A simple wrapper function to print values to the console.
  console.log(valueToPrint);
}

process.stdin.on("data", function (inputChunk) {
  // Event handler for when data chunks are received from standard input.
  rawData += inputChunk; // Append the new chunk to the raw data buffer.
});

process.stdin.on("end", function () {
  // Event handler for when the standard input stream has ended.
  rawData = rawData.trim().split(/\s+/); // Clean up the raw data: trim whitespace and split into an array of tokens.
  processTasks(); // Initiate the main task processing workflow.
});
