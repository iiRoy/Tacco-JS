function ExecuteProblemSolver(dataPayload) {
  // Step 1: Normalize and parse the raw input string.
  // The input is expected to be multiline, with the first line containing N,
  // and the second line containing space-separated numeric values.
  const processedLines = dataPayload
    .split('\n') // Break the input string into an array of lines.
    .filter(line => line.trim() !== ''); // Remove any empty lines, including a potential trailing one.

  // Guard against insufficient input lines.
  if (processedLines.length < 2) {
    // In a production scenario, this might throw an error or log a warning.
    // For typical competitive programming, we assume valid input format.
    return;
  }

  // Extract the total count of elements (N) from the first line.
  // Ensure it's parsed as an integer with base 10.
  const totalElementsCount = Number.parseInt(processedLines[0].split(' ')[0], 10);

  // Extract and prepare the numeric data points from the second line.
  // These values are converted to numbers and then sorted in ascending order.
  const sortedNumericValues = processedLines[1]
    .split(' ') // Split the string by spaces into an array of string numbers.
    .map(Number) // Convert each string element to its numeric equivalent.
    .sort((valA, valB) => valA - valB); // Sort the numbers numerically in ascending order.

  // Step 2: Calculate the lengths of consecutive runs of identical values.
  // This process groups identical adjacent numbers and counts their occurrences.
  // The resulting array will store these run lengths (e.g., for "1 1 2 2 2", it becomes [2, 3]).
  let groupSizeFrequencies = [];

  // Handle the edge case of an empty input array for numeric values.
  if (sortedNumericValues.length === 0) {
    // If there are no numeric values, the groupSizeFrequencies array remains empty.
  } else {
    // Initialize tracking for the first run.
    let currentRunLength = 1;
    let lastEncounteredValue = sortedNumericValues[0];

    // Iterate through the sorted values starting from the second element.
    for (let currentIdx = 1; currentIdx < sortedNumericValues.length; currentIdx++) {
      const currentValue = sortedNumericValues[currentIdx];

      // If the current value matches the last one, extend the current run.
      if (currentValue === lastEncounteredValue) {
        currentRunLength++;
      } else {
        // A new distinct value signifies the end of the previous run.
        // Store its length and then reset for the new sequence.
        groupSizeFrequencies.push(currentRunLength);
        lastEncounteredValue = currentValue;
        currentRunLength = 1; // Start counting for the new distinct value.
      }
    }
    // After the loop, the length of the very last run must also be pushed.
    groupSizeFrequencies.push(currentRunLength);
  }

  // Sort the array of run lengths in ascending order.
  // This sorting is essential for the subsequent calculation logic which sums
  // the smallest run lengths.
  groupSizeFrequencies.sort((lenA, lenB) => lenA - lenB);

  // Step 3: Perform calculations for each possible target group count.
  // The outer loop iterates from 1 up to the total number of elements (N).
  // Each iteration `targetGroupCount` represents a specific number of groups
  // we are trying to analyze.
  for (let targetGroupCount = 1; targetGroupCount <= totalElementsCount; targetGroupCount++) {
    let sumOfRelevantRunLengths = 0; // This variable accumulates a partial sum of run lengths.

    // Determine how many of the smallest run lengths to consider.
    // This calculation effectively means we are discarding the (targetGroupCount - 1)
    // largest run lengths from our `groupSizeFrequencies` array.
    const numberOfRunsToSum = groupSizeFrequencies.length - targetGroupCount + 1;

    // Sum the first `numberOfRunsToSum` elements from the sorted `groupSizeFrequencies`.
    // A check ensures that `numberOfRunsToSum` is positive to prevent invalid array access
    // and correctly handle scenarios where no runs are left to sum (yielding 0).
    if (numberOfRunsToSum > 0) {
      for (let runIdx = 0; runIdx < numberOfRunsToSum; runIdx++) {
        sumOfRelevantRunLengths += groupSizeFrequencies[runIdx];
      }
    }

    // Calculate the final result for the current `targetGroupCount`.
    // This involves taking the minimum of two derived values:
    // 1. `Math.floor(totalElementsCount / targetGroupCount)`: The maximum items
    //    if `totalElementsCount` items were divided as evenly as possible into
    //    `targetGroupCount` groups.
    // 2. `sumOfRelevantRunLengths * targetGroupCount`: A value derived from
    //    the accumulated sum of selected run lengths, multiplied by the
    //    current `targetGroupCount`.
    const finalResultForIteration = Math.min(
      Math.floor(totalElementsCount / targetGroupCount),
      sumOfRelevantRunLengths * targetGroupCount
    );

    // Output the calculated result for the current iteration.
    console.log(finalResultForIteration);
  }
}

// The following section is for standard input/output handling
// and should not be modified, as per the problem's instructions.
ExecuteProblemSolver(require("fs").readFileSync("/dev/stdin", "utf8"));