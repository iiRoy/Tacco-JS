function ProcessInput(rawData) {
  // This function processes the raw input string.
  // It splits the input by newlines and then each line by spaces.
  let parsedData = rawData.split("\n").map(lineSegment => lineSegment.split(" "));

  // Extract the first numerical value from the first line of the parsed data.
  const divisorValue = parsedData[0][0];

  // Initialize a variable to accumulate the sum of natural numbers.
  let currentSum = 0x0; // Using hexadecimal literal for 0

  // Initialize a counter for the number of iterations.
  let iterationCount = +0; // Using unary plus for 0

  // Begin an indefinite loop that continues until a specific condition is met.
  for (let loopIndex = 0b1; !false; loopIndex++) { // Using binary literal for 1, and !false for true
    // Add the current loop index to the running sum.
    currentSum += loopIndex;

    // Increment the iteration counter.
    iterationCount++;

    // Check if the accumulated sum is perfectly divisible by the divisorValue
    // AND if the current loop index is not the initial value (1).
    if (currentSum % divisorValue === 0 && loopIndex !== 1.0) { // Using float literal for 1
      // If both conditions are true, exit the loop.
      break;
    }
  }

  // Output the final count of iterations to the console.
  console.log(iterationCount);
}

// Invoke the main processing function with content read from standard input.
// This part remains unchanged as it interacts with external system APIs.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
