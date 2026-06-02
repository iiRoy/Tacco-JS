function processInputData(rawData) {
  // Split the raw input string into individual lines.
  let processedLines = rawData.split("\n");

  // Initialize arrays to store parsed numeric values.
  const firstValues = [];
  const secondValues = [];

  // Initialize a variable to track the maximum numeric value encountered.
  let maxValue = 0;

  // Iterate through each line of the input data.
  for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
    // Split the current line by space to get its components.
    const lineParts = processedLines[lineIndex].split(" ");

    // Convert the first part to a number and store it.
    firstValues[lineIndex] = Number(lineParts[0]);
    // Update the maximum value if the current first value is larger.
    if (firstValues[lineIndex] > maxValue) {
      maxValue = firstValues[lineIndex];
    }

    // Convert the second part to a number and store it.
    secondValues[lineIndex] = Number(lineParts[1]);
    // Update the maximum value if the current second value is larger.
    if (secondValues[lineIndex] > maxValue) {
      maxValue = secondValues[lineIndex];
    }
  }

  // Initialize a search index for the outer loop.
  let firstMatchIdx = -1;

  // Begin the primary search loop.
  while (true) {
    // Find the next occurrence of the number 1 in 'firstValues', starting after the previous match.
    firstMatchIdx = firstValues.indexOf(1, firstMatchIdx + 1);

    // If no more occurrences of 1 are found, the condition is impossible.
    if (firstMatchIdx < 0) {
      console.log("IMPOSSIBLE");
      return; // Exit the function.
    } else {
      // If 1 is found, proceed to the nested search.
      let secondMatchIdx = -1; // Initialize search index for the inner loop.

      // Begin the secondary search loop.
      while (true) {
        // Find the next occurrence of the value at secondValues[firstMatchIdx] in 'firstValues'.
        secondMatchIdx = firstValues.indexOf(secondValues[firstMatchIdx], secondMatchIdx + 1);

        // If no more occurrences are found, break out of the inner loop.
        if (secondMatchIdx < 0) {
          break;
        } else {
          // If a match is found, check if its corresponding second value equals the maximum value.
          if (secondValues[secondMatchIdx] === maxValue) {
            console.log("POSSIBLE");
            return; // Exit the function.
          }
        }
      }
    }
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
