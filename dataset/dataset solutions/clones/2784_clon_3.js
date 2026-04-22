const processInputData = (rawTextContent) => {
  // First, normalize the input by trimming whitespace and splitting it into individual lines.
  // This step prepares the data for structured parsing.
  const linesOfData = rawTextContent.trim().split('\n');

  // Perform initial validation: ensure there are at least two lines.
  // The first line typically indicates a count or size, and the second contains the actual data.
  if (linesOfData.length < 2) {
    console.error("Input processing error: Not enough lines provided. Expected at least 2 lines.");
    // In scenarios where no valid triplets can be formed, 0 is a sensible default.
    return 0;
  }

  // Attempt to parse the declared length from the first line.
  // This value is often used to specify how many elements of the sequence to consider.
  const specifiedCountStr = linesOfData[0];
  const declaredSequenceLength = Number.parseInt(specifiedCountStr, 10);

  // Validate the parsed declared length. If it's not a valid non-negative number,
  // log a warning but proceed using the actual array length for safety.
  if (Number.isNaN(declaredSequenceLength) || declaredSequenceLength < 0) {
    console.warn(`Data integrity warning: Invalid declared sequence length '${specifiedCountStr}'. Defaulting to actual array length for iteration limits.`);
    // A negative or invalid declared length should not allow iterations.
    return 0;
  }

  // Process the second line to extract the numeric sequence.
  // It's split by spaces, filtered to remove any empty strings (e.g., from double spaces),
  // and then each part is converted to a number.
  const numericValues = linesOfData[1]
    .split(' ')
    .filter(segment => segment.length > 0) // Ensure no empty strings from multiple spaces
    .map(strValue => Number(strValue)); // Convert string to number, handles integers and floats

  // Initialize a counter for the specific pattern we are looking for:
  // elements that are the middle point of a strictly monotonic triplet (increasing or decreasing).
  let monotonicMidpointsFound = 0;

  // A triplet requires at least three elements. If the sequence is too short, no triplets can be formed.
  // Also, the loop needs `currentPosition - 1` and `currentPosition + 1` to be valid.
  // So, `currentPosition` must be at least 1 and at most `numericValues.length - 2`.
  // If `numericValues.length` is less than 3, this condition will prevent the loop.
  if (numericValues.length < 3) {
    return 0;
  }

  // Determine the effective upper bound for our iteration.
  // The loop iterates `currentPosition` from 1 up to `declaredSequenceLength - 2`.
  // However, it must also respect the actual bounds of `numericValues` (`numericValues.length - 2`).
  // We take the minimum of these two to ensure we don't access out-of-bounds elements.
  const effectiveLoopUpperBound = Math.min(declaredSequenceLength - 2, numericValues.length - 2);

  // If the effective upper bound is less than 1 (meaning `declaredSequenceLength` or `numericValues.length`
  // is too small for any valid triplet iterations), then no processing is needed.
  if (effectiveLoopUpperBound < 1) {
    return 0;
  }

  // Iterate through the numeric sequence, focusing on elements that have both a preceding and a succeeding element.
  // The loop starts at index 1 and goes up to `effectiveLoopUpperBound` (inclusive).
  for (let currentPosition = 1; currentPosition <= effectiveLoopUpperBound; ++currentPosition) {
    // Extract the three consecutive elements forming a potential triplet.
    const precedingValue = numericValues[currentPosition - 1];
    const centralValue = numericValues[currentPosition];
    const succeedingValue = numericValues[currentPosition + 1];

    // Check for a strictly increasing sequence: preceding < central < succeeding.
    const isIncreasingTrend = (precedingValue < centralValue) && (centralValue < succeedingValue);

    // Check for a strictly decreasing sequence: preceding > central > succeeding.
    const isDecreasingTrend = (precedingValue > centralValue) && (centralValue > succeedingValue);

    // If the central value is part of either a strictly increasing or strictly decreasing triplet,
    // increment our counter.
    if (isIncreasingTrend || isDecrecreasingTrend) {
      monotonicMidpointsFound++;
    }
  }

  // Display the final count of detected monotonic midpoints.
  console.log(monotonicMidpointsFound);
  // For potential external testing or further processing, return the result.
  return monotonicMidpointsFound;
};

// Standard boilerplate for reading input in a typical competitive programming setup.
// This reads the entire content from standard input ('/dev/stdin') as a UTF-8 string.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Execute the main data processing logic with the obtained input.
processInputData(standardInputContent);