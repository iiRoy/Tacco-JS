// This function computes the total absolute deviation for a given base offset value
// across a provided numeric data series. It calculates the sum of absolute differences
// between each element in the series and a target value derived from the base offset
// and the element's position.
function computeAbsoluteDeviationSum(baseOffsetValue, sourceDataSequence) {
  // Validate the input array to ensure it's an array and not empty.
  // An empty sequence implies no deviations, so the sum is zero.
  if (!Array.isArray(sourceDataSequence) || sourceDataSequence.length === 0) {
    return 0; // Return zero if the input sequence is invalid or empty.
  }

  let totalAbsoluteDeviation = 0; // Initialize an accumulator for the sum.

  // Iterate through each numeric item and its index in the source data sequence.
  sourceDataSequence.forEach((currentNumericItem, itemPosition) => {
    // Determine the specific target value for the current item based on
    // the global base offset and its sequential position (1-indexed).
    const targetCalculatedValue = baseOffsetValue + itemPosition + 1;

    // Add the absolute difference between the current item and its target
    // to the running total.
    totalAbsoluteDeviation += Math.abs(currentNumericItem - targetCalculatedValue);
  });

  return totalAbsoluteDeviation; // Return the final aggregated deviation sum.
}

// This primary function orchestrates the solution: reading input,
// performing data transformations, identifying candidate values,
// calculating deviations, and outputting the minimum result.
function processAndDetermineMinimumDeviation(rawInputTextPayload) {
  // Parse the raw input string into an array of lines,
  // robustly handling different newline characters (\n or \r\n).
  const parsedInputLines = rawInputTextPayload.split(/\r?\n/);

  // Extract and validate the total count of data points from the first line.
  // Ensure the count is a positive integer; otherwise, log an error and exit.
  const totalCountOfElements = Number(parsedInputLines[0]);
  if (isNaN(totalCountOfElements) || totalCountOfElements <= 0) {
    console.error("Input Error: The specified total count of elements is invalid or non-positive.");
    return; // Terminate execution due to invalid input.
  }

  // Parse the original numeric series from the second line.
  // Split the string by spaces and convert each segment to a number.
  const initialNumericSeries = parsedInputLines[1].split(' ').map(Number);

  // Validate that the actual number of parsed elements matches the declared count.
  // Inconsistency indicates a malformed input.
  if (initialNumericSeries.length !== totalCountOfElements) {
    console.error("Input Error: Mismatch between the declared element count and the actual series length.");
    return; // Terminate execution due to inconsistent input.
  }

  // Calculate the central position index (0-based, floor(N/2)) of the series.
  // This index is used to select a primary candidate for the offset parameter.
  const centralElementIndex = Math.floor(totalCountOfElements / 2);

  // Create a new sequence by transforming each element of the original series:
  // new_element[i] = original_element[i] - (i + 1).
  // This transformation is key to the problem's mathematical model.
  const transformedNumericSequence = initialNumericSeries.map((valueAtCurrentIndex, currentPosition) => {
    const adjustedValue = valueAtCurrentIndex - (currentPosition + 1);
    return adjustedValue;
  });

  // Identify the primary candidate for the base offset ('b' in the original problem)
  // from the transformed sequence at the central element's index.
  const primaryOffsetCandidate = transformedNumericSequence[centralElementIndex];

  // Prepare a set of candidate offset values to evaluate.
  // The original problem's structure implicitly checks values around this central point.
  // Robustly handle cases where `totalCountOfElements` is small and indices might be out of bounds.
  let candidateOffset_A = primaryOffsetCandidate; // First candidate is the primary one.
  let candidateOffset_B = primaryOffsetCandidate + 1; // Default fallback for second candidate.
  let candidateOffset_C = primaryOffsetCandidate + 2; // Default fallback for third candidate.

  // If there are sufficient elements, use the values directly from the transformed sequence
  // for the second and third candidates.
  if (centralElementIndex + 1 < totalCountOfElements) {
    candidateOffset_B = transformedNumericSequence[centralElementIndex + 1];
  }
  // For the third candidate, if `centralElementIndex + 2` is out of bounds,
  // we retain the fallback `primaryOffsetCandidate + 2`. This ensures three candidates
  // are always evaluated, aligning with the original problem's intent even for small N.
  if (centralElementIndex + 2 < totalCountOfElements) {
    candidateOffset_C = transformedNumericSequence[centralElementIndex + 2];
  }

  // Calculate the total absolute deviation for each identified candidate offset.
  // Each calculation uses the original numeric series.
  const deviationTotalFor_A = computeAbsoluteDeviationSum(candidateOffset_A, initialNumericSeries);
  const deviationTotalFor_B = computeAbsoluteDeviationSum(candidateOffset_B, initialNumericSeries);
  const deviationTotalFor_C = computeAbsoluteDeviationSum(candidateOffset_C, initialNumericSeries);

  // Determine the minimum deviation among all calculated totals.
  const overallMinimumDeviation = Math.min(deviationTotalFor_A, deviationTotalFor_B, deviationTotalFor_C);

  // Output the final minimum deviation value to the console.
  console.log(overallMinimumDeviation);
}

// Entry point for execution: Reads input from standard input (typically '/dev/stdin' on Linux/macOS
// or analogous for other environments) and passes it to the main processing function.
processAndDetermineMinimumDeviation(require('fs').readFileSync('/dev/stdin', 'utf8'));