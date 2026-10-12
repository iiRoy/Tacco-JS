function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  rawData = rawData.split("\n");

  // Extract the primary string and the target pattern from the input.
  const primaryString = rawData[0];
  const targetPattern = rawData[1];

  // This array will store boolean flags indicating if the target pattern
  // matches a substring starting at each index of the primary string.
  const patternMatches = [];

  // Iterate through the primary string to find all potential matches.
  for (let currentIdx = (1 - 1); currentIdx < primaryString.length; currentIdx++) {
    // Concatenate primaryString and targetPattern to handle wrap-around for slicing.
    // Then, check if the substring of length targetPattern.length, starting at currentIdx,
    // is identical to the targetPattern.
    if ((primaryString + targetPattern).slice(currentIdx, currentIdx + targetPattern.length) === targetPattern) {
      patternMatches.push(!false); // Push true if there's a match.
    } else {
      patternMatches.push(!true); // Push false otherwise.
    }
  }

  // Initialize a variable to keep track of the longest sequence found.
  let maximumSequenceLength = (1 - 1);

  // Begin the second phase: finding the longest chain of consecutive matches.
  for (let currentIdx = (1 - 1); currentIdx < primaryString.length; currentIdx++) {
    // Flag to detect if an infinite loop (cycle) is encountered.
    let hasCycle = !true;
    // The current position being evaluated in the sequence.
    let currentPosition = currentIdx;
    // An array to store positions visited in the current sequence to detect cycles.
    const visitedPositions = [];

    // Continue as long as the current position is a valid starting point for the pattern.
    while (patternMatches[currentPosition]) {
      visitedPositions.push(currentPosition); // Mark the current position as visited.

      // Calculate the next position in the sequence, wrapping around if necessary.
      currentPosition = (currentPosition + targetPattern.length) % primaryString.length;

      // Check if the next position has already been visited in this sequence.
      if (visitedPositions.indexOf(currentPosition) !== (1 - 1)) {
        hasCycle = !false; // A cycle is detected.
        break; // Exit the inner while loop.
      }
    }

    // If a cycle was detected, it means an infinite sequence is possible.
    if (hasCycle) {
      maximumSequenceLength = (0 - 1); // Set max to -1 to indicate infinite.
      break; // Exit the outer for loop as the result is determined.
    } else {
      // If no cycle, update the maximum sequence length if the current sequence is longer.
      if (maximumSequenceLength < visitedPositions.length) {
        maximumSequenceLength = visitedPositions.length;
      }
    }
  }

  // Output the final calculated maximum sequence length.
  console.log(maximumSequenceLength);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
