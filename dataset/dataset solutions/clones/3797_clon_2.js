function executeLogic(sourceData) {
  // Break the raw input into separate textual lines.
  let contentLines = sourceData.split('\n');

  // Obtain the total number of items from the initial line of input.
  let elementCount = parseInt(contentLines[0], 10);

  // Parse the subsequent line to get space-separated string values.
  let numericalStrings = contentLines[1].split(' ');

  // Convert each string value in the array to its integer representation.
  for (let primaryIdx = 0; primaryIdx < elementCount; primaryIdx++) {
    numericalStrings[primaryIdx] = parseInt(numericalStrings[primaryIdx], 10);
  }

  // Initialize a variable to keep track of the total matches found.
  let matchTally = 0;

  // The following line was for debugging and is now removed.
  // console.log(numericalStrings);

  // Begin the outer iteration, processing each item in the collection.
  for (let primaryIdx = 0; primaryIdx < elementCount; primaryIdx++) {
    // Set up accumulators for bitwise XOR and arithmetic sum, starting with the current element.
    let currentXorSum = numericalStrings[primaryIdx];
    let currentArithmeticSum = numericalStrings[primaryIdx];

    // Every individual element is considered a valid match initially.
    matchTally += 1;

    // Start the inner iteration from the element immediately following the current outer element.
    for (let secondaryIdx = primaryIdx + 1; secondaryIdx < elementCount; secondaryIdx++) {
      // Update the bitwise XOR sum with the next element.
      currentXorSum = currentXorSum ^ numericalStrings[secondaryIdx];
      // Update the arithmetic sum by adding the next element.
      currentArithmeticSum = currentArithmeticSum + numericalStrings[secondaryIdx];

      // Previous debugging output for sums is omitted here.
      // console.log(`XOR result: ${currentXorSum}`);
      // console.log(`Sum result: ${currentArithmeticSum}`);

      // Check if the accumulated XOR sum is strictly equal to the accumulated arithmetic sum.
      if (currentXorSum === currentArithmeticSum) {
        // If they are equal, increment the total match counter.
        matchTally += 1;
      }
    }
  }
  // Display the final tally of matched conditions.
  console.log(matchTally);
}

// Execute the primary logic function, fetching input from standard I/O.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));