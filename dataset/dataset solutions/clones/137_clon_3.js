(function(rawData) {
  // Ensure input is a string and handle potential empty input
  if (typeof rawData !== 'string' || rawData.trim() === '') {
    console.error("No valid input provided. Exiting.");
    return;
  }

  // Remove leading/trailing whitespace (including newlines) and split into individual data lines.
  // Using 'let' for variables that will be reassigned.
  let contentLines = rawData.trim().split('\n');

  // Helper function to parse a single line of data into its components.
  const extractLineComponents = (lineString) => {
    // Skip empty lines that might result from split or initial trim
    if (lineString.trim() === '') {
      return null;
    }
    const parts = lineString.split(',').map(val => Number(val.trim()));
    // Basic validation: ensure we have at least 3 numeric parts (data array, factorA, factorB)
    // Also check if any conversion to Number resulted in NaN.
    if (parts.length < 3 || parts.some(isNaN)) {
      console.warn(`Skipping malformed or incomplete line: "${lineString}"`);
      return null;
    }
    const factorB = parts.pop(); // The last number on the line
    const factorA = parts.pop(); // The second to last number on the line
    const dataArray = parts;     // The remaining numbers form the data array
    return { dataArray, factorA, factorB };
  };

  // Iterate over each line of processed content to execute the core logic.
  for (let lineIndex = 0; lineIndex < contentLines.length; ++lineIndex) {
    const parsedData = extractLineComponents(contentLines[lineIndex]);

    if (parsedData === null) {
      continue; // Skip to the next line if parsing failed for the current one
    }

    const { dataArray, factorA, factorB } = parsedData;

    // Invoke the primary calculation function and output its return value.
    const computedSegment = determineThresholdSegment(dataArray, factorA, factorB);
    console.log(computedSegment);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input file descriptor

/**
 * Calculates a 1-based segment index by comparing a weighted target point
 * against the cumulative sums of an array of initial values.
 *
 * @param {number[]} initialValues - An array of numeric values.
 * @param {number} weightA - The first weighting factor (e.g., v1).
 * @param {number} weightB - The second weighting factor (e.g., v2).
 * @returns {number} The determined 1-based segment index. Returns 1 for edge cases.
 */
function determineThresholdSegment(initialValues, weightA, weightB) {
  // Guard clause: Handle cases where the input array is empty or not an array.
  // In such scenarios, no cumulative sums can be formed, so we return a default segment.
  if (!Array.isArray(initialValues) || initialValues.length === 0) {
    // Returning 1 as a sensible default when no data points exist.
    return 1;
  }

  // Guard clause: Prevent division by zero if the sum of weights is zero.
  const sumOfWeights = weightA + weightB;
  if (sumOfWeights === 0) {
    // If weights sum to zero, the target point calculation is undefined.
    // Returning 1 as a default, indicating the first segment.
    return 1;
  }

  // Step 1: Compute the cumulative (prefix) sums of the initial values.
  // This array will store [a[0], a[0]+a[1], a[0]+a[1]+a[2], ...].
  const cumulativeSums = [];
  let currentAccumulatedSum = 0; // Temporary variable to build up sums
  for (let dataIdx = 0; dataIdx < initialValues.length; ++dataIdx) {
    currentAccumulatedSum += initialValues[dataIdx];
    cumulativeSums.push(currentAccumulatedSum);
  }

  // Step 2: Calculate the total sum of all initial values.
  // This is simply the last element of the cumulative sums array.
  const overallTotalSum = cumulativeSums[cumulativeSums.length - 1];

  // Step 3: Determine the weighted target point.
  // This value is used to compare against the cumulative sums.
  const weightedTargetPoint = (overallTotalSum * weightA) / sumOfWeights;

  // Step 4: Find the segment index where the weighted target point falls.
  // The segment index is 1-based.
  let resultSegmentIndex = 1;

  // Iterate through the cumulative sums array.
  for (let sumCheckIdx = 0; sumCheckIdx < cumulativeSums.length; ++sumCheckIdx) {
    // If the weighted target point is greater than the current cumulative sum,
    // it means the point lies beyond this segment. We update the potential
    // result segment index and continue checking the next sum.
    if (weightedTargetPoint > cumulativeSums[sumCheckIdx]) {
      // The original logic implies 'c = i + 2'.
      // If sumCheckIdx is 0, c becomes 2. This means if x > l[0], we are in segment 2 or higher.
      // If x <= l[0], segment is 1.
      // So, if x > l[sumCheckIdx], the segment must be at least (sumCheckIdx + 1) + 1.
      resultSegmentIndex = sumCheckIdx + 2;
      continue; // Move to the next cumulative sum
    }
    // If the weighted target point is less than or equal to the current cumulative sum,
    // we have found the segment it belongs to. We return the current resultSegmentIndex.
    return resultSegmentIndex;
  }

  // If the loop completes, it signifies that the weighted target point was
  // greater than all cumulative sums. In this scenario, the point falls
  // into a segment beyond the last defined one. The last assigned value
  // to resultSegmentIndex (cumulativeSums.length + 1) is the correct return.
  return resultSegmentIndex;
}