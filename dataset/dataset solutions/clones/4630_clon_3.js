(function(rawInputText) {
  // Utilize the Node.js 'fs' module for file system operations.
  // Assign it to a constant for clearer referencing within this scope.
  const fileSystemModule = require("fs");

  // This section is dedicated to parsing the raw string input.
  // The input is first split into an array of lines based on newline characters.
  const processedInputLines = rawInputText.split("\n");

  // --- Input Validation and Data Extraction ---

  // Ensure that there are at least two lines of input:
  // one for the element count and one for the data sequence itself.
  if (processedInputLines.length < 2) {
    console.error("RUNTIME ERROR: Insufficient input lines provided. Expected at least 2.");
    process.exit(1); // Terminate the process with an error code.
  }

  // Parse the first line to determine the expected number of elements in the sequence.
  // Using the Number() constructor for robust string-to-number conversion.
  const declaredElementCount = Number(processedInputLines[0]);

  // Validate the parsed element count to ensure it's a valid positive number.
  if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    console.error("RUNTIME ERROR: Invalid or non-positive element count detected. Must be a number greater than 0.");
    process.exit(1);
  }

  // Parse the second line, which contains the space-separated numeric sequence.
  // Each string element is immediately converted to a number using .map(Number).
  const numericalDataSequence = processedInputLines[1].split(" ").map(Number);

  // Perform a crucial validation: check if the number of actual parsed elements
  // matches the count declared in the first line.
  if (numericalDataSequence.length < declaredElementCount) {
    console.error(`RUNTIME ERROR: Declared element count (${declaredElementCount}) is greater than actual elements provided (${numericalDataSequence.length}).`);
    process.exit(1);
  }
  // If more elements are provided than declared, we will only process up to the declared count
  // in the loop, consistent with the original code's behavior (using 'n' as loop limit).

  // --- Core Logic for Trend Analysis ---

  // Initialize a counter to keep track of how many times a full trend reversal (up-then-down or down-then-up) is observed.
  let trendReversalObservations = 0;

  // Boolean flags to indicate if an ascending or descending trend has been seen
  // since the last trend reversal was counted and flags were reset.
  let hasObservedAscendingSegment = false;
  let hasObservedDescendingSegment = false;

  // Iterate through the numeric sequence, comparing each element with its successor.
  // The loop runs up to 'declaredElementCount - 1' to ensure valid index access for 'nextSequenceValue'.
  for (let sequencePosition = 0; sequencePosition < declaredElementCount - 1; ++sequencePosition) {
    // Retrieve the current and subsequent values from the sequence for comparison.
    // These values are guaranteed to be numbers due to the earlier .map(Number) operation.
    const currentSequenceValue = numericalDataSequence[sequencePosition];
    const nextSequenceValue = numericalDataSequence[sequencePosition + 1];

    // Check if the sequence is currently increasing.
    if (currentSequenceValue < nextSequenceValue) {
      hasObservedAscendingSegment = true;
    }
    // Check if the sequence is currently decreasing.
    // Using 'else if' makes it explicit that ties (currentValue === nextValue)
    // do not alter the trend flags, maintaining the original logic's behavior.
    else if (currentSequenceValue > nextSequenceValue) {
      hasObservedDescendingSegment = true;
    }

    // If both an ascending and a descending segment have been observed
    // since the last reset, it signifies a complete "turn" or "reversal" in the trend.
    if (hasObservedAscendingSegment && hasObservedDescendingSegment) {
      // Increment the total count of observed trend reversals.
      trendReversalObservations++;

      // Reset the trend observation flags to start tracking for the next potential reversal.
      hasObservedAscendingSegment = false;
      hasObservedDescendingSegment = false;
    }
  }

  // --- Output Result ---

  // Display the final count of trend reversals detected.
  // A more descriptive output string is used for clarity.
  console.log("Total distinct trend reversals observed: %d", trendReversalObservations);

  // The immediately-invoked function expression (IIFE) is supplied with the
  // content of standard input, read synchronously and decoded as UTF-8.
})(fileSystemModule.readFileSync("/dev/stdin", "utf8"));