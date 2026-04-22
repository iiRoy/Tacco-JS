function ProcessData(rawDataLines) {
  // This function processes the incoming raw string data
  let processedLines = rawDataLines.split("\n");

  // Extract the total number of records from the first line
  const recordQuantity = Number.parseInt(processedLines[0]);

  // Remove the header line (which contained the record quantity)
  processedLines.shift();

  // Trim the array to only include the actual data records, up to recordQuantity
  processedLines.splice(recordQuantity, processedLines.length);

  // Convert string lines into arrays of numbers
  // Each inner array represents a data point with two numeric values
  let numericalPoints = processedLines.map(
    (currentLineEntry) =>
      currentLineEntry
        .split(" ")
        .map((numericString) => Number.parseInt(numericString))
  );

  // Sort the data points based on their first element in ascending order
  numericalPoints.sort(
    function (itemA, itemB) {
      return itemA[0] - itemB[0];
    }
  );

  // Initialize the counter for valid segments
  let segmentCounter = 1;
  // Initialize the current segment's right boundary
  let rightBoundary = numericalPoints[0][0] + numericalPoints[0][1];

  // Iterate through the remaining data points
  for (let currentPointIndex = 1; currentPointIndex < recordQuantity; currentPointIndex++) {
    // Check if the current point overlaps with the previous segment
    if (rightBoundary > numericalPoints[currentPointIndex][0] - numericalPoints[currentPointIndex][1]) {
      // If there's an overlap, update the right boundary to the minimum of current and new potential
      rightBoundary = Math.min(
        rightBoundary,
        numericalPoints[currentPointIndex][0] + numericalPoints[currentPointIndex][1]
      );
    } else {
      // If no overlap, a new segment starts
      segmentCounter++;
      // Set the new right boundary
      rightBoundary = numericalPoints[currentPointIndex][0] + numericalPoints[currentPointIndex][1];
    }
  }

  // Output the final count to the console
  console.log("%d", segmentCounter);
  // Return the calculated segment count
  return segmentCounter;
}

/*
 * This utility function helps in debugging by comparing results
 * against expected outputs in a web environment.
 */
function verifySolution(testCaseIdentifier) {
  // Retrieve the input value for the current test case from the DOM
  const testInputContent = document.getElementById("input" + testCaseIdentifier).value;
  // Execute the main processing logic with the retrieved input
  const computedResult = ProcessData(testInputContent);

  // Initialize a string to indicate the validation outcome
  let validationOutcome = "Incorrect"; // Default to "Incorrect Answer"

  // Compare the computed result with the expected output from the DOM
  if (
    computedResult ==
    Number.parseInt(document.getElementById("output" + testCaseIdentifier).value.split("\n")[0])
  ) {
    validationOutcome = "Correct"; // If they match, it's "Accepted"
  }

  // Update the DOM element with the validation outcome
  document.getElementById("result" + testCaseIdentifier).innerHTML = validationOutcome;
}

// Execute the primary data processing function with data read from standard input
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));