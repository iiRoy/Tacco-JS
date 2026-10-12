function ProcessInput(initialValue) {
  // Convert the provided string input into an integer for numerical operations.
  initialValue = parseInt(initialValue, 10);

  let currentSum = 0; // This variable accumulates the sum of loop counters.
  let lastIndex = 0;  // This variable stores the value of the loop counter 'loopCounter' in each iteration.

  // Begin a loop that continues as long as the 'currentSum' is less than the 'initialValue'.
  for (let loopCounter = 0; currentSum < initialValue; loopCounter++) {
    currentSum = currentSum + loopCounter; // Add the current 'loopCounter' to the running total.
    lastIndex = loopCounter;             // Update 'lastIndex' with the current 'loopCounter' value.
  }

  // Print the final value stored in 'lastIndex' to the console.
  console.log('%s', lastIndex);
}

// This function is provided for debugging purposes, typically in a browser environment.
function performDebug() {
  // Retrieve the string value from an HTML input element with the ID "input".
  const debugInputString = document.getElementById("input").value;
  // Invoke the main processing function with the retrieved debug input.
  ProcessInput(debugInputString);
}

// Execute the primary logic by reading input from standard input.
// The 'require("fs").readFileSync' method reads the content of the specified file synchronously.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
