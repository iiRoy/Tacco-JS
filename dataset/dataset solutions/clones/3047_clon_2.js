function ProcessInput(rawData) {
  // This section prepares the input string for processing.
  let parts = rawData.trim().split(" ");
  let firstVal = parts[0]; // The first numerical component.
  let secondVal = parts[1]; // The second numerical component.

  // A variable to hold the computed outcome.
  let finalResult;

  // Logic to determine the final result based on value comparison.
  if (firstVal > secondVal) {
    finalResult = firstVal * 2 - 1; // If the first value is larger.
  } else if (secondVal > firstVal) {
    finalResult = secondVal * 2 - 1; // If the second value is larger.
  } else if (firstVal == secondVal) {
    finalResult = firstVal * 2; // If both values are identical.
  }

  // Output the calculated result to the standard console.
  console.log(finalResult);
} // End of the primary processing function.

// Execute the main function, reading input from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
