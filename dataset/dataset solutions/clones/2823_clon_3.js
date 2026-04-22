const processInputData = (rawInputString) => {
  // Break down the entire input content into separate logical lines.
  const inputLines = rawInputString.split('\n');

  // A preliminary check to ensure the input structure is as expected.
  // We need at least two lines for configuration and data.
  if (inputLines.length < 2) {
    console.error("Input processing error: Insufficient data lines provided.");
    return;
  }

  // The first line typically contains global configuration values.
  // For instance, the total count of items and a specific threshold.
  const configurationParameters = inputLines[0].split(' ');

  // Extract the total number of elements expected in the sequence.
  const totalElementQuantity = Number(configurationParameters[0]);
  // Extract the numerical boundary that the cumulative sum should not exceed.
  const sumUpperBoundary = Number(configurationParameters[1]);

  // Validate the parsed numerical parameters to prevent unexpected behavior.
  if (isNaN(totalElementQuantity) || isNaN(sumUpperBoundary) || totalElementQuantity < 0) {
    console.error("Input processing error: Invalid numeric values in the configuration line.");
    return;
  }

  // The second line contains the actual sequence of numbers to be processed.
  // Each string token is converted into its numerical equivalent.
  const numericValueSequence = inputLines[1].split(' ').map(val => Number(val));

  // Initialize a variable to accumulate the sum of elements as we iterate.
  let currentRunningSum = 0;
  // This variable will store the 1-based index of the first point where
  // the cumulative sum exceeds the boundary. It defaults to the total quantity
  // if the sum never exceeds the boundary throughout the sequence.
  let finalDeterminedIndex = totalElementQuantity;

  // Iterate through the numeric sequence using a zero-based index.
  // The loop continues as long as the current index is within the bounds of the expected total.
  for (let sequencePosition = 0; sequencePosition < totalElementQuantity; sequencePosition++) {
    // Retrieve the numerical value at the current position.
    const valueAtCurrentPosition = numericValueSequence[sequencePosition];

    // Increment the running sum with the current element's value.
    currentRunningSum += valueAtCurrentPosition;

    // Check if the accumulated sum has now surpassed the defined upper boundary.
    if (currentRunningSum > sumUpperBoundary) {
      // If the sum exceeds, record the 1-based position (sequencePosition + 1).
      finalDeterminedIndex = sequencePosition + 1;
      // Once the condition is met, there's no need to continue iterating;
      // we've found the earliest point of exceedance.
      break;
    }
  }

  // Output the calculated index to standard output.
  console.log(finalDeterminedIndex);
};

// This self-executing block handles the environment-specific input reading.
// It typically reads from stdin in competitive programming contexts.
try {
  // Dynamically import the 'fs' (file system) module for reading files.
  const fileSystemManager = require('fs');
  // Read the entire content of standard input synchronously, using UTF-8 encoding.
  const stdinContent = fileSystemManager.readFileSync('/dev/stdin', 'utf8');
  // Pass the raw content to our primary processing function.
  processInputData(stdinContent);
} catch (ioError) {
  // Catch and report any errors that occur during the input/output operations.
  console.error("Execution failure: An error occurred while reading input or processing data.", ioError.message);
  // In a production system, more robust error handling might be implemented,
  // such as logging the error and exiting with a non-zero status code.
  // process.exit(1);
}