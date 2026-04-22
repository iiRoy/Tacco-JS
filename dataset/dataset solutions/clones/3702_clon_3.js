function calculateDeviationSum(baseValue, sourceArray) {
  // A utility function to compute the sum of absolute differences
  // between array elements and a shifted sequence.
  // This is often used in optimization problems related to L1 norm.

  if (!Array.isArray(sourceArray)) {
    // Input validation: Ensure the second argument is an array.
    console.error("Error: sourceArray must be an array.");
    return NaN; // Or throw an error, depending on desired error handling.
  }

  // Initialize accumulator for the sum of absolute differences.
  let cumulativeDifference = 0;

  // Iterate through the input array, calculating the absolute difference
  // for each element and accumulating the sum.
  // The target value for each sourceArray[idx] is baseValue + (idx + 1).
  for (let idx = 0; idx < sourceArray.length; idx++) {
    const targetSequenceValue = baseValue + idx + 1;
    cumulativeDifference += Math.abs(sourceArray[idx] - targetSequenceValue);
  }

  // Return the total computed deviation.
  return cumulativeDifference;
}

function processDataAndComputeMinimum(rawDataString) {
  // Main function to parse input, perform calculations, and output the result.
  // It aims to find an optimal 'b' value that minimizes the deviation sum.

  // Split the raw input string into individual lines.
  const inputLines = rawDataString.split('\n');

  // Basic input validation: Ensure there are at least two lines.
  if (inputLines.length < 2) {
    console.error("Input error: Not enough lines provided.");
    return;
  }

  // Parse the number of elements from the first line.
  const elementCount = parseInt(inputLines[0], 10);

  // Validate the parsed element count.
  if (isNaN(elementCount) || elementCount <= 0) {
    console.error("Input error: Invalid or non-positive element count.");
    return;
  }

  // Parse the array of numbers from the second line.
  // Each string element is converted to an integer.
  const originalNumericData = inputLines[1].split(' ').map(sVal => parseInt(sVal, 10));

  // Validate that the number of parsed elements matches the declared count.
  if (originalNumericData.length !== elementCount) {
    console.error("Input error: Mismatch between declared element count and actual data length.");
    return;
  }

  // Transform the original data: For each element A[i], calculate A[i] - (i+1).
  // This transformation simplifies the problem to finding the median of the new array.
  const transformedValues = originalNumericData.map((val, currentIdx) => {
    const sequenceOffset = currentIdx + 1; // Calculate the (i+1) part
    return val - sequenceOffset;
  });

  // Sort the transformed values in ascending order.
  // Sorting is crucial for finding the median.
  transformedValues.sort((valA, valB) => valA - valB);

  // Determine the optimal 'b' value based on the median of the transformed, sorted array.
  // This 'b' minimizes the sum of absolute differences.
  let optimalBaseCandidate;
  const centralElementIndex = Math.floor(elementCount / 2);

  if (elementCount % 2 === 0) {
    // If the number of elements is even, the median is typically
    // any value between the two central elements (inclusive).
    // The original problem implementation uses the floor of their average.
    const lowerMedian = transformedValues[centralElementIndex - 1]; // First of the two middle elements
    const upperMedian = transformedValues[centralElementIndex];     // Second of the two middle elements
    // Using Math.trunc for integer division, functionally equivalent to Math.floor for positive numbers.
    optimalBaseCandidate = Math.trunc((lowerMedian + upperMedian) / 2);
  } else {
    // If the number of elements is odd, the median is the single central element.
    optimalBaseCandidate = transformedValues[centralElementIndex];
  }

  // Calculate the final minimum deviation sum using the determined optimal 'b'.
  const finalCalculatedSum = calculateDeviationSum(optimalBaseCandidate, originalNumericData);

  // Output the final result.
  if (isNaN(finalCalculatedSum)) {
      console.error("Calculation failed to produce a valid number.");
  } else {
      process.stdout.write(String(finalCalculatedSum) + '\n');
  }
}

// Entry point: Read input from standard input and pass it to the main processing function.
try {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processDataAndComputeMinimum(fileContent);
} catch (error) {
  console.error("Failed to read input from /dev/stdin:", error.message);
}