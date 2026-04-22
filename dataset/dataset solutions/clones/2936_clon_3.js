// This module is designed to process input data containing a series of numerical ranges.
// Its primary function is to compute the length of the common intersection among all provided ranges.
function processRangeData(rawInputText) {
  // Step 1: Prepare the raw input text.
  //   - Use .trim() to remove any leading or trailing whitespace, including potential extra newlines.
  //   - Split the cleaned string into an array of individual lines.
  const inputLines = rawInputText.trim().split('\n');

  // Guard Clause 1: Basic validation for input presence.
  // If no lines are provided, it's an invalid input scenario.
  if (inputLines.length === 0) {
    console.error("Processing Error: No input lines were detected. Cannot proceed.");
    return;
  }

  // Step 2: Parse the initial configuration parameters from the first line.
  //   - The first line is expected to contain two space-separated numbers.
  //   - .map(Number) is used to convert the string tokens directly into numerical types.
  const firstLineTokens = inputLines[0].split(' ').map(Number);
  const initialElementCount = firstLineTokens[0]; // This variable (N in original) is parsed but not used in this specific logic.
  const numberOfRanges = firstLineTokens[1]; // This variable (M in original) dictates how many ranges follow.

  // Guard Clause 2: Validate the parsed number of ranges.
  // Ensure 'numberOfRanges' is a valid, non-negative integer.
  if (isNaN(numberOfRanges) || numberOfRanges < 0) {
    console.error("Processing Error: The specified number of ranges is invalid or missing.");
    return;
  }

  // Edge Case Handling: If no ranges are specified, the intersection length is 0.
  if (numberOfRanges === 0) {
      console.log(0);
      return;
  }

  // Guard Clause 3: Verify that there are enough input lines for all ranges.
  // We need 1 line for parameters + 'numberOfRanges' lines for the actual ranges.
  if (inputLines.length < numberOfRanges + 1) {
      console.error(`Processing Error: Expected ${numberOfRanges + 1} input lines but only found ${inputLines.length}.`);
      return;
  }

  // Step 3: Collect and store the start and end coordinates for each range.
  // These arrays will hold numerical values.
  const startCoordinates = []; // Corresponds to 'L' in the original code.
  const endCoordinates = [];   // Corresponds to 'R' in the original code.

  // Loop through the input lines, starting from the second line (index 1),
  // up to the line corresponding to the last range.
  for (let rangeIndex = 0; rangeIndex < numberOfRanges; ++rangeIndex) {
    const currentRangeDefinition = inputLines[rangeIndex + 1]; // +1 because first line is parameters.
    const rangeBoundaries = currentRangeDefinition.split(' ').map(Number);

    const currentStart = rangeBoundaries[0];
    const currentEnd = rangeBoundaries[1];

    // Guard Clause 4: Validate individual range boundary values.
    if (isNaN(currentStart) || isNaN(currentEnd)) {
      console.error(`Processing Error: Invalid numerical boundaries found on line ${rangeIndex + 2}.`);
      return;
    }

    startCoordinates.push(currentStart);
    endCoordinates.push(currentEnd);
  }

  // Step 4: Determine the overall intersection boundaries.
  //   - The maximum start point among all ranges defines the beginning of the intersection.
  //   - The minimum end point among all ranges defines the end of the intersection.
  // Initialize with extreme values to ensure any valid coordinate updates them correctly.
  let globalMaxStart = -Infinity; // Tracks the largest lower bound found.
  let globalMinEnd = Infinity;    // Tracks the smallest upper bound found.

  // Iterate through the collected coordinates once to find both globalMaxStart and globalMinEnd.
  for (let k = 0; k < numberOfRanges; ++k) {
    globalMaxStart = Math.max(globalMaxStart, startCoordinates[k]);
    globalMinEnd = Math.min(globalMinEnd, endCoordinates[k]);
  }

  // Step 5: Calculate the length of the common intersection.
  //   - If globalMinEnd is less than globalMaxStart, it means there is no overlap
  //     between all ranges (e.g., [1,5] and [6,10]), so the intersection is empty.
  //   - Otherwise, the intersection exists, and its length is calculated as
  //     (end_point - start_point + 1).
  let intersectionLength = 0;
  if (globalMinEnd >= globalMaxStart) {
    intersectionLength = globalMinEnd - globalMaxStart + 1;
  }

  // Step 6: Output the final calculated intersection length.
  console.log(intersectionLength);
}

// Example invocation for testing purposes.
// This typically reads input from a file named 'data.txt' in the same directory.
// Ensure 'data.txt' exists and contains input in the specified format.
// Example 'data.txt' content:
// 5 3
// 1 4
// 2 5
// 3 6
// Expected Output for this example: 2 (The common intersection is [3,4], which has a length of 2).
processRangeData(require("fs").readFileSync("./data.txt", "utf8"));