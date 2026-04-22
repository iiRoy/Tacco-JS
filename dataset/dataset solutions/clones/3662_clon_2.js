function ProcessInputData(rawData) {
  // This function takes raw string input and processes it
  // into a structured format for further calculations.

  // First, split the input by newlines, then each line by spaces,
  // finally converting each segment to a number.
  let numericGrid = rawData
    .split("\n")
    .map(lineFragment => lineFragment.split(" ").map(numStr => numStr * 1));

  // Extract the total number of elements and operations from the first line.
  let totalElements = numericGrid[0][0]; // Represents 'N'
  let operationCount = numericGrid[0][1]; // Represents 'M'

  // Slice the relevant operation intervals, then sort them based on their end points.
  const sortedOperations = numericGrid
    .slice(1, operationCount + 1)
    .sort((opA, opB) => opA[1] - opB[1]);

  // Initialize the current boundary based on the first operation's end point.
  // A specific offset is applied as per problem logic.
  let currentBoundary = sortedOperations[0][1] - 2;

  // Initialize a counter for distinct, non-overlapping operations.
  let distinctOperations = 1;

  // Iterate through the sorted list of operations to find the maximum non-overlapping set.
  for (let idx = 0; idx < operationCount; idx += 1) {
    // Check if the current operation's start point overlaps with the established boundary.
    if (sortedOperations[idx][0] - 1 <= currentBoundary) {
      // If there's an overlap, this operation cannot be chosen, so skip it.
      continue;
    } else {
      // If no overlap, update the boundary to the end of the current operation,
      // applying the same specific offset.
      currentBoundary = sortedOperations[idx][1] - 2;
      // Increment the count of distinct operations.
      distinctOperations++;
    }
  }

  // Output the final count of distinct operations to the console.
  console.log(distinctOperations);
}

// Execute the processing function by reading input from standard input.
// It loads the 'fs' (file system) module and reads the file content as UTF-8.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));