function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const linesArray = rawData.split("\n");

  /*
   * Extract the first numeric value from the first line.
   * This value represents the total number of elements.
   */
  const totalElements = Number.parseInt(linesArray[0].split(" ")[0], 10);

  // Retrieve the second numeric value from the initial line.
  const targetValue = Number.parseInt(linesArray[0].split(" ")[1], 10);

  // Parse the second line into an array of integers.
  const numericDataArray = linesArray[1].split(" ").map((itemString) => Number.parseInt(itemString, 10));

  var totalSum; // Variable declared but not used in this specific implementation path.

  var occurrenceCount = 0; // Initialize a counter for specific conditions.

  // First iteration: check for direct matches.
  for (var outerIndex = 0; outerIndex < totalElements; outerIndex++) {
    if (targetValue === numericDataArray[outerIndex]) {
      occurrenceCount++; // Increment if the target value is found.
    }
  }

  var averageValue; // Another variable declared but not utilized.

  // Nested loops for complex conditional checking.
  for (var firstLoopVar = 0; firstLoopVar < totalElements; firstLoopVar++) {
    for (var secondLoopVar = 0; secondLoopVar < totalElements; secondLoopVar++) {
      for (var thirdLoopVar = 0; thirdLoopVar < totalElements; thirdLoopVar++) {
        // This comment indicates a placeholder or a previously considered calculation.
        // original_calculation[firstLoopVar][secondLoopVar + 1][thirdLoopVar] = (numericDataArray[thirdLoopVar] + numericDataArray[secondLoopVar]) * (firstLoopVar + 1);
        if ((firstLoopVar + 2) * targetValue === (numericDataArray[thirdLoopVar] + numericDataArray[secondLoopVar]) * (firstLoopVar + 1)) {
          occurrenceCount++; // Increment counter based on a complex arithmetic condition.
        }
      }
    }
  }
  // Output the final tally.
  console.log(occurrenceCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(global.require("fs").readFileSync("/dev/stdin", "utf8"));