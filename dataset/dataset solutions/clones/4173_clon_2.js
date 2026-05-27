function processInputData(rawData) {
  // Split the raw input string into individual lines for processing.
  const inputLines = rawData.split('\n');

  // Parse the first line to extract two integer values.
  // The first value (firstValue) is extracted but not used in this specific logic.
  const firstValue = parseInt(inputLines[0].split(' ')[0], 10);
  // The second value (thresholdCount) is crucial for the algorithm.
  const thresholdCount = parseInt(inputLines[0].split(' ')[1], 10);

  // Parse the second line, convert elements to integers, and sort them numerically.
  const numericSequence = inputLines[1].split(' ').map(val => parseInt(val, 10)).sort((a, b) => a - b);

  // This array will store the counts of consecutive identical numbers.
  const groupCounts = [];
  let currentElement = numericSequence[0]; // Initialize with the first element.
  let elementCount = 1; // Initialize count for the first element.

  // Iterate through the sorted sequence to find groups of identical numbers.
  // The loop goes up to and including numericSequence.length to handle the last group.
  for (let idx = 1; idx <= numericSequence.length; idx++) {
    if (numericSequence[idx] === currentElement) {
      // If the current element is the same as the previous one, increment count.
      elementCount++;
    } else {
      // If different, push the accumulated count to groupCounts.
      groupCounts.push(elementCount);
      // Reset count for the new element.
      elementCount = 1;
    }
    // Update the current element for the next iteration.
    currentElement = numericSequence[idx];
  }

  // Sort the array of group counts in ascending order.
  groupCounts.sort((valA, valB) => valA - valB);

  let finalSum = 0; // Initialize the accumulator for the final result.

  // If the number of distinct groups is less than or equal to the threshold,
  // no elements need to be removed, so the sum is 0.
  if (groupCounts.length <= thresholdCount) {
    console.log(finalSum);
    return; // Exit the function early.
  }

  // Iterate through the sorted group counts.
  // We want to sum the smallest groups until the remaining number of groups
  // is equal to or less than the thresholdCount.
  for (let idx = 0; idx < groupCounts.length; idx++) {
    const currentGroupSize = groupCounts[idx];
    finalSum += currentGroupSize; // Add the current group's size to the sum.

    // Check if, after considering the current group, the number of remaining groups
    // (from this point onwards) is less than or equal to the threshold.
    // If so, we have removed enough groups, and finalSum holds the result.
    if (groupCounts.length - (idx + 1) <= thresholdCount) {
      console.log(finalSum);
      return; // Exit the function.
    }
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
