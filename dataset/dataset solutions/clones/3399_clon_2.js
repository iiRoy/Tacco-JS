function ProcessInput(rawData) {
  // Break down the incoming raw data string into individual lines.
  let lines = rawData.split("\n");

  // Parse the initial line to ascertain the total number of records for processing.
  let recordCount = parseInt(lines[0], 10);

  // Establish an array to hold the parsed numeric data points; this mirrors 'A' from the source.
  dataPoints = new Array(recordCount);

  // Dissect the second line of input into temporary string values; this reflects 'tmp'.
  tempVals = lines[1].split(" ");

  // Populate the dataPoints array by converting each temporary string to an integer.
  for (outerIndex = 0; outerIndex < recordCount; outerIndex++) {
    dataPoints[outerIndex] = parseInt(tempVals[outerIndex], 10);
  }

  // A preliminary variable for a computed value, set to 1 (will be redefined later).
  let resultValueOne = 1;

  // A binary indicator flag to track a specific state within the algorithm.
  let stateFlag = 0;

  // The ultimate numerical outcome of the processing.
  let finalResult = 0;

  // A variable to keep track of the highest value encountered in current blocks.
  let currentMaxBlockValue = 0;

  // Construct an array of block counters, initialized based on the first data point.
  // Each element is set to 1, replicating the behavior of 'B' in the original.
  blockCounters = new Array(dataPoints[0]).fill(1);

  // Begin the primary iteration through the data points, starting from the second element.
  for (outerIndex = 1; outerIndex < recordCount; outerIndex++) {

    // Commence an internal loop to identify the peak block value and check for uniformity.
    for (innerIndex = 0; innerIndex < blockCounters.length; innerIndex++) {
      currentMaxBlockValue = Math.max(currentMaxBlockValue, blockCounters[innerIndex]);
      // If any block counter deviates from the initial block counter, activate the state flag.
      if (blockCounters[innerIndex] !== blockCounters[0]) {
        stateFlag = 1;
        break; // Terminate this inner loop promptly upon detecting non-uniformity.
      }
    }

    // Apply conditional logic based on the comparison of current and preceding data points, and the state flag.
    if (dataPoints[outerIndex] > dataPoints[outerIndex - 1]) {
      // Should the current data point exceed the previous one, expand the block counters array.
      for (innerIndex = 0; innerIndex < dataPoints[outerIndex] - dataPoints[outerIndex - 1]; innerIndex++) {
        blockCounters.push(1); // Append new counters, each initialized to unity.
      }

    } else if (stateFlag === 0) {
      // If the state flag indicates uniformity, increment a specific counter and trim the array.
      blockCounters[dataPoints[outerIndex] - 1] = blockCounters[dataPoints[outerIndex] - 1] + 1;
      blockCounters = blockCounters.slice(0, dataPoints[outerIndex]);

    } else if (stateFlag === 1) {
      // If the state flag signals non-uniformity, first truncate the array, then increment a specific counter.
      blockCounters = blockCounters.slice(0, dataPoints[outerIndex]);
      for (innerIndex = dataPoints[outerIndex] - 1; innerIndex >= 0; innerIndex--) {
        // Locate the first counter not matching the maximum block value and increment it.
        if (blockCounters[innerIndex] !== currentMaxBlockValue) {
          blockCounters[innerIndex] = blockCounters[innerIndex] + 1;
          break; // Conclude the inner loop once an increment has occurred.
        }
      }
    }
  }

  // Following all computational steps, ascertain the maximum value among the finalized block counters.
  for (outerIndex = 0; outerIndex < blockCounters.length; outerIndex++) {
    finalResult = Math.max(finalResult, blockCounters[outerIndex]);
  }

  // Print the computed maximum value to the standard output.
  console.log('%s', finalResult);
}


// This helper function facilitates local testing and debugging operations.
function performDebug() {
  // Obtain the textual content from an HTML input element with a specific ID.
  let debugContent = document.getElementById("inputField").value;
  // Channel this retrieved content into the primary data processing function.
  ProcessInput(debugContent);
}

// Invoke the main processing routine by fetching input from the standard input stream.
// This specific execution path is typically used in a Node.js runtime environment.
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf-8"));