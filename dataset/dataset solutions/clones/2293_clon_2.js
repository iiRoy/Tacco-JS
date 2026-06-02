function ProcessInput (rawData) {
  // Convert the raw string input into an array of numerical values.
  let parsedNumbers = rawData.split(" ").map(singleVal => parseInt(singleVal, 10));

  // Loop a specific number of iterations based on the third element.
  for (let idx = 0; idx < parsedNumbers[2]; idx++) {
    // Check if the first number can be decremented.
    if (parsedNumbers[0] >= 1) {
      parsedNumbers[0]--;
    }
    // Otherwise, check if the second number can be decremented.
    else if (parsedNumbers[1] >= 1) {
      parsedNumbers[1]--;
    }
  }

  // Print the final values of the first two numbers to the console.
  console.log("%d %d", parsedNumbers[0], parsedNumbers[1]);
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
