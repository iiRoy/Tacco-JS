// This module encapsulates a utility function designed to read, parse, and accumulate numerical data
// from a multi-line string input. It processes a limited number of initial lines,
// stopping early if an empty line is encountered or if the input is exhausted.

/**
 * Analyzes a given string input, interpreting it as a sequence of lines.
 * It extracts and sums integer values from these lines, up to a predefined maximum count.
 * The process halts upon encountering an empty or whitespace-only line,
 * or if the input string contains fewer lines than the processing limit.
 *
 * @param {string} rawContentStream - The complete string data obtained from an input source,
 *                                    expected to contain newline-separated entries.
 * @returns {void} This function does not return a value directly; instead, it writes
 *                 the computed sum to the standard output stream, followed by a newline.
 */
function AggregateNumericEntries(rawContentStream) {
  // Pre-processing validation: Ensure the input stream is a valid string.
  // This guard clause prevents runtime errors from unexpected input types.
  if (typeof rawContentStream !== 'string' || rawContentStream === null || rawContentStream === undefined) {
    // In a real-world application, one might throw an error or return a specific error code.
    // For this context, a console error and early exit suffices.
    console.error("Input stream must be a non-null string for processing.");
    return;
  }

  // Configuration constant: Defines the upper bound for the number of lines to parse.
  // This makes the limit explicit and easily modifiable.
  const MAXIMUM_LINES_TO_ANALYZE = 10;

  // Data preparation: Split the raw stream into individual line segments.
  // Using .trim() on the raw stream before splitting helps normalize inputs
  // by removing any leading or trailing whitespace/newlines that might
  // otherwise create unintended empty entries at the array's boundaries.
  const contentSegments = rawContentStream.trim().split('\n');

  // Accumulator variable: Stores the running total of parsed numerical values.
  // Initialized to zero, as no values have been processed yet.
  let cumulativeSum = 0;

  // Iteration control: Loop through the `contentSegments` array.
  // The loop continues as long as the current index is within the `MAXIMUM_LINES_TO_ANALYZE`
  // and does not exceed the actual number of available content segments.
  for (let segmentIndex = 0; segmentIndex < MAXIMUM_LINES_TO_ANALYZE; ++segmentIndex) {
    // Boundary check: If we've processed all available segments before reaching the maximum limit,
    // gracefully exit the loop. This prevents attempting to access undefined array elements.
    if (segmentIndex >= contentSegments.length) {
      break;
    }

    const currentSegment = contentSegments[segmentIndex];

    // Early termination condition: If a segment, after trimming whitespace, is empty,
    // it signals the end of meaningful input for this processing logic.
    // This addresses the original code's implied intent of stopping on "empty" lines.
    if (currentSegment.trim() === '') {
      break;
    }

    // Conversion attempt: Parse the current segment into an integer.
    // Specifying radix (10) is crucial for `parseInt` to avoid unexpected behavior
    // with octal or hexadecimal interpretations of certain string formats.
    const numericValue = parseInt(currentSegment, 10);

    // Validation: Check if the parsing operation resulted in a valid number.
    // `isNaN()` is used to determine if `parseInt` successfully converted the string.
    // Only valid numbers are added to the sum, preventing `NaN` propagation.
    if (!isNaN(numericValue)) {
      cumulativeSum += numericValue;
    }
    // Note: Lines that are not empty but also not valid numbers (e.g., "hello")
    // will be ignored and not contribute to the sum, without stopping the process.
  }

  // Final Output: Display the computed total sum.
  // `process.stdout.write` is used as an alternative to `console.log`,
  // providing similar functionality for basic output, ensuring a newline character.
  process.stdout.write(String(cumulativeSum) + '\n');
}

// Entry point: The script executes the main aggregation function.
// It retrieves the entire content from standard input synchronously using Node.js's 'fs' module.
// The content is then passed to our processing function.
AggregateNumericEntries(require("fs").readFileSync("/dev/stdin", "utf8"));