// Entry point function to handle the entire data processing workflow
function processInputData(inputLines) {
  // Validate and parse the number of elements from the initial line of input.
  // Using the Number() constructor for explicit type conversion from string.
  const elementCount = Number(inputLines[0]);

  // Implement a guard clause for edge cases where the input count is invalid or zero.
  // If elementCount is not a valid number or is less than 1, output 0 as a default.
  if (isNaN(elementCount) || elementCount < 1) {
    console.log(0);
    return;
  }

  // Process the second line of input, splitting it by spaces and converting each part
  // into a numeric value using the unary plus operator for concise type coercion.
  const numericalSequence = inputLines[1].split(" ").map(valStr => +valStr);

  // Calculate the total sum of all elements in the sequence using the reduce method.
  // This provides the 'overallSum' which is crucial for determining the midpoint.
  const overallSum = numericalSequence.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Determine the target value for half of the total sum, using floating-point division
  // to ensure accuracy when the sum is an odd number.
  const targetHalfSum = overallSum / 2.0;

  let currentPrefixSum = 0; // Accumulates sum of elements in the left partition, similar to 'mae'.
  let identifiedPivotIndex = -1; // Stores the index of the element that causes the sum to cross the midpoint.
  let valueAtPivot = 0; // Stores the actual value of the element at the identified pivot index.

  // Iterate through the numerical sequence to find the optimal split point.
  // The loop aims to identify the first element that causes the running sum to exceed or equal 'targetHalfSum'.
  for (let sequenceIdx = 0; sequenceIdx < elementCount; ++sequenceIdx) {
    const currentSequenceElement = numericalSequence[sequenceIdx]; // The element A[i]

    // If adding the current element keeps the prefix sum below the target, continue accumulating.
    if ((currentPrefixSum + currentSequenceElement) < targetHalfSum) {
      currentPrefixSum += currentSequenceElement;
    }
    // If adding the current element results in an exact half-sum, the deviation is 0.
    // Output 0 and terminate early, as this is the best possible split.
    else if ((currentPrefixSum + currentSequenceElement) === targetHalfSum) {
      console.log(0);
      return;
    }
    // If adding the current element makes the prefix sum exceed the target,
    // this element is our pivot. Store its index and value, then exit the loop.
    else {
      identifiedPivotIndex = sequenceIdx;
      valueAtPivot = currentSequenceElement;
      break;
    }
  }

  // Calculate the sum of elements in the right partition.
  // This is derived by subtracting the left partition sum (currentPrefixSum)
  // and the pivot element's value from the overall sum.
  const remainingRightSum = overallSum - currentPrefixSum - valueAtPivot;

  // Compute the absolute difference between the left and right partition sums.
  const partitionMagnitudeDifference = Math.abs(remainingRightSum - currentPrefixSum);

  // Calculate the final deviation: the absolute difference between the pivot element's value
  // and the magnitude difference between the two partitions.
  const finalCalculatedDeviation = Math.abs(valueAtPivot - partitionMagnitudeDifference);

  // Output the computed final deviation.
  console.log(finalCalculatedDeviation);
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// Reads the entire input, decodes it as UTF-8, and splits it into an array of lines.
// This array is then passed to the main processing function.
processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);