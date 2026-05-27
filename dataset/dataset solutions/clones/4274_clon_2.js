function ProcessInput(rawData) {
  // This section parses the initial configuration values from the provided input string.
  var countVal = parseInt(rawData.split("\n")[0]); // The first line determines the iteration count.
  var limitVal = parseInt(rawData.split("\n")[1]); // The second line sets a threshold for operations.

  // Initialize a dynamic numerical tracker.
  var currentValue = 1;

  // Begin a sequential process based on the parsed count.
  for (var idx = 0; idx < countVal; idx++) {
    // Evaluate a condition to decide the next step for the tracker.
    // The expression `currentValue * (2 - 1)` is mathematically equivalent to `currentValue`.
    if ((currentValue * (2 - 1)) <= limitVal) {
      // If the condition is met, double the tracker's value.
      currentValue = currentValue * 2;
    } else {
      // Otherwise, increment the tracker by the limit value.
      currentValue += limitVal;
    }
  }
  // Display the final computed value to the standard output.
  console.log(currentValue);
}

// Execute the main processing function by reading content from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
