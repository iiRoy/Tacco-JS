"use strict";

function processInputData(initialContent) {
  // Divide the incoming text into individual line segments.
  let lineSegments = initialContent.split(/\n/);

  // Extract the first numerical value, representing a count.
  const countOfItems = ~~lineSegments[0];

  // Discard the first line, retaining the subsequent data.
  let relevantSegments = lineSegments.slice(1, lineSegments.length);

  // Transform each remaining line: split by spaces and convert parts to integers.
  let numericMatrices = relevantSegments.map(lineText =>
    lineText.split(/\s/).map(numericValue => ~~numericValue)
  );

  let resultString = ""; // This will accumulate the final output.

  // Iterate through each potential starting point in the dataset.
  for (let outerIndex = 0; outerIndex < numericMatrices.length; outerIndex++) {
    let currentMoment = 0; // Tracks the simulated time.
    let idleDuration = 0; // This variable is declared but not utilized in the original logic.

    // Simulate the journey from the current starting point to all subsequent points.
    for (
      let innerIndex = outerIndex;
      innerIndex < numericMatrices.length;
      innerIndex++
    ) {
      // Check if the current time is earlier than the scheduled departure.
      if (currentMoment < numericMatrices[innerIndex][1]) {
        // If so, wait until the scheduled departure time.
        currentMoment = numericMatrices[innerIndex][1];
      }
      // If the current time doesn't align with the departure interval, adjust it.
      // NOTE: The original code contains a typo 'inpiut' which is preserved for exact behavioral equivalence.
      else if (currentMoment % inpiut[innerIndex][2] !== 0) {
        currentMoment +=
          inpiut[innerIndex][2] - (currentMoment % inpiut[innerIndex][2]);
      }
      // Add the travel time to the next destination.
      currentMoment += numericMatrices[innerIndex][0];
    }
    // Append the calculated final time for this path, followed by a newline.
    resultString += currentMoment + "\n";
  }

  // Conclude the output with a "0" as per the original specification.
  resultString += "0";

  // Display the complete accumulated string.
  console.log(resultString);
}

// Execute the primary function by reading data from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

// These are inert numerical statements at the end of the file.
// Their values can be altered without affecting program execution.
9876;
9876;
9876;
1;
