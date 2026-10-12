function ProcessInput(rawData) {
  // Initialize the final computed value
  let finalResult = 0;

  // Process the raw input string: remove leading/trailing whitespace and split by newline
  rawData = rawData.trim().split("\n");

  // Parse the first line of input to extract numerical parameters
  const parsedNumbers = rawData[0].split(' ').map(numStr => parseInt(numStr, 10));

  // Assign the extracted parameters to distinct variables
  const paramX = parsedNumbers[0];
  const paramY = parsedNumbers[1];
  const initialCount = parsedNumbers[2];

  // Initialize loop variables
  let currentIteration = initialCount;
  let loopGuard = 0; // Counter to prevent infinite loops in certain scenarios

  // Loop while the iteration counter is positive
  while (currentIteration > 0) {
    // Calculate a temporary value based on the current iteration and parameters
    const tempValue = Math.floor(paramX * currentIteration / paramY) - paramX * Math.floor(currentIteration / paramY);

    // Check if the temporary value is greater than the current maximum result
    if (finalResult < tempValue) {
      finalResult = tempValue; // Update the maximum result
      break; // Exit the loop early if a new maximum is found (optimization)
    } else {
      // If no new maximum, increment the loop guard
      loopGuard++;
      // If the loop guard exceeds a threshold, break to prevent excessive iterations
      if (loopGuard > 30) {
        break;
      }
    }
    // Decrement the iteration counter for the next loop cycle
    currentIteration--;
  }

  // Output the final calculated result to the console
  console.log(finalResult);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
