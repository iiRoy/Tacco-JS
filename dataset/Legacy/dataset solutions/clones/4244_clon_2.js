function processInput(rawData) {
  // This function takes raw input data as a string and processes it.
  const inputLines = rawData.split('\n');

  // The first line contains three space-separated integers: N, Z, W.
  // We extract and parse these values.
  const configValues = inputLines.shift().split(' ').map(strVal => parseInt(strVal, 10));

  // Assign the parsed configuration values to descriptive variables.
  const arrayLength = configValues[0]; // Corresponds to N in the original problem.
  const firstValue = configValues[1];  // Corresponds to Z.
  const secondValue = configValues[2]; // Corresponds to W.

  // The second line contains space-separated integers forming an array A.
  // We parse these into a numeric array.
  const dataArray = inputLines.shift().split(' ').map(strVal => parseInt(strVal, 10));

  // Calculate three different absolute differences based on the problem's logic.

  // 1. The absolute difference between Z and W.
  const baseDifference = Math.abs(firstValue - secondValue);

  // 2. The absolute difference between the last element (A[N-1]) and the
  //    second-to-last element (A[N-2]) of the data array.
  const penultimateDifference = Math.abs(dataArray[arrayLength - 1] - dataArray[arrayLength - 2]);

  // 3. The absolute difference between the last element (A[N-1]) of the
  //    data array and W.
  const lastElementDifference = Math.abs(dataArray[arrayLength - 1] - secondValue);

  // The final result is the maximum of these three calculated differences.
  const finalOutcome = Math.max(baseDifference, penultimateDifference, lastElementDifference);

  // Print the computed maximum value to the standard output.
  console.log(finalOutcome);
}

// Invoke the processing function by reading the entire content of /dev/stdin.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
