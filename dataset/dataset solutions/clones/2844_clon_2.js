function ProcessInput(rawData) {
  'use strict'; /* Enforce strict parsing and error handling rules. */

  const linesData = rawData.split('\n'); // Divide the incoming text into individual lines.
  const numEntries = parseInt(linesData.shift(), 10); // Extract the first line, convert it to an integer, and store it.
  const diffPairs = []; // Initialize a collection to store calculated difference pairs.
  const unusedArray = []; // This array is declared but not utilized in the current logic.

  // Process each of the subsequent 'numEntries' lines.
  for (let idx = 0; idx < numEntries; idx++) {
    linesData[idx] = linesData[idx].split(' '); // Split each line by space into an array of strings.
    // The original code had a commented-out line here:
    // linesData[idx].forEach(elementVal => parseInt(elementVal));
    // This comment is preserved in spirit, but the actual parsing is done later implicitly.
  }

  // Sort the processed lines based on the numerical value of their first element.
  linesData.sort((itemA, itemB) => itemA[0] - itemB[0]);

  // Generate all unique pairs of entries and calculate their coordinate differences.
  for (let idx = 0; idx < numEntries - 1; idx++) {
    for (let subIdx = idx + 1; subIdx < numEntries; subIdx++) {
      // Calculate the difference in x-coordinates and y-coordinates.
      diffPairs.push([
        linesData[idx][0] - linesData[subIdx][0],
        linesData[idx][1] - linesData[subIdx][1]
      ]);
    }
  }

  // Sort the array of difference pairs.
  diffPairs.sort();

  let currentCount = 1; // Tracks the count of consecutive identical difference pairs.
  let maxCount = 0; // Stores the maximum count found so far.

  // Iterate through the sorted difference pairs to find the longest sequence of identical pairs.
  for (let idx = 0; idx < diffPairs.length - 1; idx++) {
    // Compare current pair with the next pair using JSON stringification for deep comparison.
    if (JSON.stringify(diffPairs[idx]) === JSON.stringify(diffPairs[idx + 1])) {
      currentCount++; // Increment count if they are identical.
    } else {
      // If not identical, check if the current sequence is the longest.
      if (maxCount < currentCount) {
        maxCount = currentCount;
      }
      currentCount = 1; // Reset counter for a new sequence.
    }
  }
  // Note: The original code does not explicitly handle the case where the longest sequence
  // is at the very end of the array. This behavior is preserved.
  if (maxCount < currentCount) {
    maxCount = currentCount;
  }


  // Output the final result, which is the total number of entries minus the maximum count of identical difference pairs.
  console.log(numEntries - maxCount);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified as per the problem statement.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
