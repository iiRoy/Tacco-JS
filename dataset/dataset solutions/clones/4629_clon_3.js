// Configuration for the standard input/output interface.
const standardInputReader = require('readline').createInterface({
  input: process.stdin,  // Directs input from the standard input stream.
  output: process.stdout // Directs output to the standard output stream (required but not used for writing here).
});

// A control variable used to manage the initial state or a first-pass scenario.
// Set to true initially to indicate that the first line should be bypassed.
let initialLineSkipped = false;

/**
 * This function serves as the primary handler for each line of text received from the input stream.
 * It orchestrates the entire data processing workflow for a given line.
 * @param {string} incomingDataString The raw string data read from a single line of input.
 */
function handleInputLine(incomingDataString) {
  // Implement a guard clause to skip the very first line of input,
  // as it often contains metadata or is not part of the actual data sequence.
  if (!initialLineSkipped) {
    initialLineSkipped = true; // Mark that the initial line has now been processed (skipped).
    return; // Terminate execution for this line.
  }

  // Step 1: Parse the incoming string into an array of numeric values.
  // This involves splitting the string by whitespace, filtering out any empty segments,
  // and converting each valid segment into a number.
  const numericalSequence = incomingDataString
    .split(/\s+/) // Splits the string by one or more whitespace characters.
    .filter(fragment => fragment.length > 0) // Ensures no empty string fragments are processed.
    .map(stringSegment => {
      const convertedValue = Number(stringSegment); // Attempt to convert string to number.
      if (isNaN(convertedValue)) {
        // Log a warning for non-numeric input, but continue processing valid numbers.
        console.error(`Detected non-numeric input: '${stringSegment}'. This value will be ignored.`);
        return null; // Return null for invalid numbers to be filtered later.
      }
      return convertedValue;
    })
    .filter(val => val !== null); // Remove any nulls resulting from invalid number conversions.

  // Step 2: Validate the parsed sequence. We need at least two numbers to determine a trend.
  if (numericalSequence.length < 2) {
    process.stderr.write("Warning: Insufficient numeric data for trend analysis on this line.\n");
    process.stdout.write("0\n"); // Output 0 as no trends can be determined.
    return;
  }

  // Step 3: Analyze the sequence to identify trends between consecutive numbers.
  // The first number acts as the initial reference point, and the rest are compared against it.
  const trendIndicators = computeSequentialComparison(
    numericalSequence[0], // The first element for initial comparison.
    ...numericalSequence.slice(1) // The rest of the elements for subsequent comparisons.
  );

  // If no trend indicators were generated (e.g., due to all invalid numbers), output 0.
  if (trendIndicators.length === 0) {
    process.stdout.write("0\n");
    return;
  }

  // Step 4: Count the number of transitions where the trend pattern changes.
  // We start counting from 1 because even a single trend implies at least one segment.
  const initialSegmentCount = 1;
  const totalPatternChanges = countTrendPatternChanges(initialSegmentCount, ...trendIndicators);

  // Step 5: Output the final calculated count to standard output.
  process.stdout.write(totalPatternChanges + '\n');
}

/**
 * Recursively determines the directional trend between consecutive numbers in a sequence.
 * This function returns an array where each element indicates if the sequence increased (1),
 * decreased (-1), or remained constant (0) between two points.
 *
 * @param {number} precedingValue The number from the previous position in the sequence.
 * @param {number} currentComparisonValue The number currently being compared against the preceding value.
 * @param {...number} subsequentValues The remaining numbers in the sequence to be processed.
 * @returns {Array<number>} An array of trend indicators (1, -1, or 0).
 */
function computeSequentialComparison(precedingValue, currentComparisonValue, ...subsequentValues) {
  // Base case: If the current comparison value is undefined or not a valid number,
  // or if the preceding value itself was invalid, stop recursion.
  if (typeof currentComparisonValue === 'undefined' || isNaN(precedingValue) || isNaN(currentComparisonValue)) {
    return [];
  }

  let directionalSignal; // Variable to store the computed trend signal.

  // Explicitly determine the trend: increase, decrease, or equality.
  if (currentComparisonValue > precedingValue) {
    directionalSignal = 1; // Indicates an upward trend.
  } else if (currentComparisonValue < precedingValue) {
    directionalSignal = -1; // Indicates a downward trend.
  } else {
    directionalSignal = 0; // Indicates no change, a flat trend.
  }

  // Recursively call the function with the current value becoming the new preceding value,
  // and prepend the current directional signal to the result of the recursive call.
  return [directionalSignal, ...computeSequentialComparison(currentComparisonValue, ...subsequentValues)];
}

/**
 * Recursively counts the number of segments where the trend pattern changes.
 * For example, if trends are [1, 1, -1, -1, 0], this function would count 2 changes
 * (from 1 to -1, and from -1 to 0).
 *
 * @param {number} accumulatedChangeCount The running total of pattern changes detected so far.
 * @param {number} firstPatternSegment The trend indicator for the current segment start.
 * @param {number} secondPatternSegment The trend indicator for the next segment.
 * @param {...number} remainingPatternSegments Any further trend indicators.
 * @returns {number} The final count of trend pattern changes.
 */
function countTrendPatternChanges(accumulatedChangeCount, firstPatternSegment, secondPatternSegment, ...remainingPatternSegments) {
  // Base case: If there is no 'secondPatternSegment', it means we've reached the end of the trend sequence.
  if (typeof secondPatternSegment === 'undefined') {
    return accumulatedChangeCount;
  }

  // Determine if the current pattern is different from the subsequent one.
  const didPatternAlter = (firstPatternSegment !== secondPatternSegment);

  let updatedChangeCount = accumulatedChangeCount;
  if (didPatternAlter) {
    updatedChangeCount++; // Increment the count if a pattern transition is observed.
  }

  // Continue the recursion, moving to the next pair of pattern segments.
  // The 'secondPatternSegment' becomes the new 'firstPatternSegment' for the next comparison.
  return countTrendPatternChanges(updatedChangeCount, secondPatternSegment, ...remainingPatternSegments);
}

// Assign the main line processing function to the 'line' event of the input interface.
// This initiates the program to actively listen for and process incoming lines of data.
standardInputReader.on('line', handleInputLine);

// Optionally, define a handler for when the input stream is closed.
standardInputReader.on('close', () => {
  // This block can be used for any final cleanup, resource release, or summary output.
  // For this specific problem, no explicit action is needed on close.
  // process.stderr.write("Input stream terminated. All processing complete.\n");
});