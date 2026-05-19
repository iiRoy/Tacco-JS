function ProcessInput(rawData) {
  // Split the raw input string by newline characters
  rawData = rawData.split("\n");

  // Parse the second line of input into an array of numbers
  let numericSequence = rawData[1].split(" ").map(Number);

  // Initialize a counter for symmetric pairs
  let pairCount = 0;

  // Iterate through the numeric sequence
  for (let idx = 0; idx < numericSequence.length; idx++) {
    // Check for a symmetric pair condition
    // If the element at (numericSequence[idx] - 1) is equal to (idx + 1)
    if (numericSequence[numericSequence[idx] - 1] === idx + 1) {
      pairCount++; // Increment the counter
    }
  }

  // Output half of the total pair count
  console.log(pairCount / 2);
}

// Read input from standard input and process it
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
