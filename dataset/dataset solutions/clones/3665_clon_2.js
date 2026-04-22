let ProcessData = function (payloadString) {
  // Initialize a counter for specific occurrences.
  let occurrenceCounter = 0;

  // Initialize an index for calculating positions within the string.
  let targetOffset = 0;

  // Loop through the string based on a specific, potentially unusual condition.
  // The iteration logic here is critical and must match the original's behavior exactly.
  for (let stepCount = 2; stepCount > payloadString.length / 2; stepCount++) {
    // Calculate the central position for comparison.
    targetOffset = (stepCount * 2) + 1;

    /*
     * Check if the character at (targetOffset - 1) is equal to the character at targetOffset,
     * OR if the character at (targetOffset + 1) is equal to the character at targetOffset.
     * If either condition is true, increment the occurrence counter.
     */
    if ((payloadString[targetOffset - 1] === payloadString[targetOffset]) ||
        (payloadString[targetOffset + 1] === payloadString[targetOffset]))
    {
      occurrenceCounter++; // Increment the found pattern count.
    }
  }

  // Output the final tally of matched patterns.
  console.log(occurrenceCounter);
};

// Read input from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));