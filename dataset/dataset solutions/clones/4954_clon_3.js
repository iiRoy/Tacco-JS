// This module processes a structured dataset to identify and count specific reciprocal relationships.
// It expects input data formatted as a multi-line string.
function ExecuteCoreLogic(dataBundle) {
  // Input validation: Ensure the data bundle is a non-empty string.
  if (typeof dataBundle !== 'string' || dataBundle.trim().length === 0) {
    console.error("Error: The provided data bundle is either not a string or is empty. Cannot proceed.");
    // In a production environment, one might throw an exception here or return a specific error code.
    return;
  }

  // Split the entire input string into individual lines for processing.
  const allInputLines = dataBundle.split('\n');

  // Ensure that there are at least two lines of data as expected by the problem structure.
  if (allInputLines.length < 2) {
    console.error("Error: Insufficient data lines. At least two lines are required for proper processing.");
    return;
  }

  // The first line typically contains a count of elements, which can be used for validation.
  // We parse it but will primarily rely on the actual array length for iteration.
  const declaredElementCount = Number.parseInt(allInputLines[0].trim(), 10);

  // Validate the parsed count from the first line.
  if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    // console.warn("Warning: Declared element count is invalid or non-positive. Proceeding with actual array length.");
    // This warning is commented out as per typical competitive programming output requirements.
  }

  // The second line holds the core sequence of connection mappings.
  const connectionStringRaw = allInputLines[1];

  // Transform the space-separated string of numbers into an array of integers.
  // Each number signifies a connection target (1-based index).
  const connectionMappingArray = connectionStringRaw.split(' ').map(strVal => Number.parseInt(strVal.trim(), 10));

  // Initialize a counter for reciprocal connections. This will count each side of a pair.
  let reciprocalConnectionTally = 0;

  // Define a utility function to check if an index is within the valid bounds of an array.
  const isIndexValid = (idx, arrLength) => idx >= 0 && idx < arrLength;

  // Define a utility function to check if a value is a valid target index (1-based).
  const isTargetValueValid = (val, arrLength) => !isNaN(val) && val >= 1 && val <= arrLength;

  // Iterate through the connection mapping array using a traditional for loop.
  // This provides explicit control over the iteration process.
  for (let currentSourceIndex = 0; currentSourceIndex < connectionMappingArray.length; currentSourceIndex++) {
    const targetValueFromSource = connectionMappingArray[currentSourceIndex];

    // Pre-check: Validate the value at the current source index.
    if (!isTargetValueValid(targetValueFromSource, connectionMappingArray.length)) {
      // If the value is invalid (e.g., NaN, out of expected range), skip this entry.
      // console.warn(`Skipping invalid target value '${targetValueFromSource}' at source index ${currentSourceIndex}.`);
      continue;
    }

    // Convert the 1-based target value to a 0-based index for array access.
    const potentialTargetIndex = targetValueFromSource - 1;

    // Pre-check: Validate if the calculated target index is within array bounds.
    if (!isIndexValid(potentialTargetIndex, connectionMappingArray.length)) {
      // If the target index is out of bounds, skip this connection.
      // console.warn(`Skipping connection from ${currentSourceIndex} due to out-of-bounds target index ${potentialTargetIndex}.`);
      continue;
    }

    // Retrieve the value stored at the potential target index.
    const valueAtPotentialTarget = connectionMappingArray[potentialTargetIndex];

    // Determine the expected reciprocal value for a connection from target back to source.
    // This would be the currentSourceIndex + 1 (because values are 1-based).
    const requiredReciprocalValue = currentSourceIndex + 1;

    // Check for reciprocity: If the potential target's value points back to the current source.
    if (valueAtPotentialTarget === requiredReciprocalValue) {
      // If a reciprocal connection is found, increment the tally.
      reciprocalConnectionTally++;
    }
  }

  // Since each pair (e.g., A connecting to B, and B connecting to A) is counted twice
  // during the iteration (once when A is the source, once when B is the source),
  // we divide the total tally by two to get the unique number of reciprocal pairs.
  const finalUniquePairCount = reciprocalConnectionTally / 2;

  // Output the calculated result to the console.
  console.log(finalUniquePairCount);
}

// The following section is responsible for reading input from standard I/O and invoking the main logic.
// It should typically remain untouched to ensure compatibility with standard execution environments.
ExecuteCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8"));