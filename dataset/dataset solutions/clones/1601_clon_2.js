function ProcessInput(rawData) {
  // Deconstruct the input string into numerical values: initial position, number of steps, and step magnitude.
  const [initialPos, numSteps, stepMagnitude] = rawData
    .trim()
    .split(" ")
    .map((itemStr) => parseInt(itemStr, 10));

  // Calculate the absolute value of the ratio of initial position to step magnitude.
  const absRatio = Math.abs(initialPos / stepMagnitude);
  // Determine the remainder when the initial position is divided by the step magnitude.
  const remainderValue = initialPos % stepMagnitude;

  // Evaluate the scenario based on the initial position relative to the step magnitude.
  if (Math.abs(initialPos) < stepMagnitude) {
    // If the number of steps is an even count.
    if (numSteps % 2 === 0) {
      console.log(initialPos); // Output the initial position.
    }
    // If the number of steps is an odd count.
    else {
      console.log(initialPos + stepMagnitude); // Output the initial position adjusted by one step.
    }
  }
  // If the absolute ratio of initial position to step magnitude exceeds the number of steps.
  else if (absRatio > numSteps) {
    // If the initial position is a positive value.
    if (initialPos > 0) {
      // Calculate and output the absolute final position after moving 'numSteps' towards zero.
      console.log(Math.abs(initialPos - numSteps * stepMagnitude));
    }
    // If the initial position is a negative or zero value.
    else {
      // Calculate and output the absolute final position after moving 'numSteps' towards zero.
      console.log(Math.abs(initialPos + numSteps * stepMagnitude));
    }
  }
  // For all other cases where the absolute ratio is less than or equal to the number of steps.
  else {
    // If the number of steps is even AND the remainder is exactly zero.
    if (numSteps % 2 === 0 && remainderValue === 0) {
      console.log(stepMagnitude); // Output the step magnitude.
    }
    // Otherwise (if steps are odd, or remainder is non-zero).
    else {
      console.log(remainderValue); // Output the remainder value.
    }
  }
}

// Read the input data from standard input and invoke the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
