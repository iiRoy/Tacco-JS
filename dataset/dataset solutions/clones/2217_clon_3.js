function calculateNewMinimaCount(rawTextStream) {
  /*
   * This sophisticated algorithm processes a multi-line string input to precisely
   * determine the total number of distinct times a new minimum value is encountered
   * within a given sequence of numerical observations.
   *
   * The expected input format is stringent:
   * Line 1: Must contain a single positive integer, indicating the expected total
   *         quantity of numeric elements in the subsequent sequence.
   * Line 2: Must present a series of space-separated integers, representing the
   *         actual sequence of observations to be analyzed.
   *
   * Any deviations from this format may lead to undefined behavior or erroneous results.
   */

  // Step 1: Deconstruct the monolithic input string into individual textual lines.
  // This operation segments the input based on the standard newline character.
  const textualInputLines = rawTextStream.split('\n');

  // --- Introduction of robust input validation (Type III enhancement) ---
  // A critical preliminary check to ensure the input stream contains sufficient data.
  // Without at least two lines, the subsequent parsing steps are impossible.
  if (textualInputLines.length < 2) {
    // In a production environment, this might trigger an exception or a detailed error report.
    // For problem-solving contexts, returning zero signifies an inability to process.
    console.error("Error: Insufficient data lines detected in the input stream.");
    return 0; // Indicating no minima could be calculated from invalid input.
  }

  // --- Helper utility for parsing numeric sequences (Type III addition) ---
  // This internal function abstracts the process of converting a space-delimited
  // string of numbers into a robust array of actual numeric types.
  const extractNumericValues = (lineContent) => {
    // The filter step is crucial for robustness, eliminating any non-numeric
    // artifacts that might arise from malformed input strings (e.g., double spaces).
    return lineContent.split(' ').map(val => Number(val)).filter(num => !isNaN(num));
  };

  // Step 2: Parse the declared element count from the very first input line.
  // This value serves as an expected benchmark for the actual sequence length.
  const [declaredElementQuantity] = extractNumericValues(textualInputLines[0]);

  // Step 3: Parse the primary sequence of numeric observations from the second line.
  // This array holds the data that will be traversed to find new minima.
  const observationValueSequence = extractNumericValues(textualInputLines[1]);

  // --- Advanced validation of input integrity (Type III enhancement) ---
  // Verifies that the explicitly declared element quantity aligns with the
  // actual number of elements successfully parsed from the sequence line.
  if (declaredElementQuantity === undefined || observationValueSequence.length !== declaredElementQuantity) {
    // While this might indicate an input error, for competitive programming,
    // we often proceed with the available data, assuming the problem implies
    // the actual sequence is the source of truth if a mismatch occurs.
    // For strictness, one might throw an error here.
    // For this context, we'll proceed using the actual length of the parsed sequence.
    console.warn(`Warning: Declared element count (${declaredElementQuantity}) does not match actual sequence length (${observationValueSequence.length}). Proceeding with actual length.`);
  }

  // Determine the effective length of the sequence, prioritizing the actual parsed data.
  const effectiveSequenceLength = observationValueSequence.length;

  // --- Edge case handling (Type III addition/rewrite) ---
  // If the sequence is empty after parsing, no minima can possibly be found.
  // This guard ensures the main loop is not entered unnecessarily.
  if (effectiveSequenceLength === 0) {
    return 0; // An empty sequence yields zero new minima.
  }

  // --- Initialization of core algorithm variables (Type II/III rewrite) ---
  // Initialize the tracker for the lowest value observed so far.
  // Setting it to positive infinity ensures that the very first element
  // of any non-empty sequence will always be recognized as a new minimum.
  let currentLowestRecordedValue = Number.POSITIVE_INFINITY;

  // Initialize the counter for new minimum discoveries.
  // This variable will accumulate the total occurrences of new lowest values.
  let newMinimumDiscoveryCounter = 0;

  // Step 4: Iterate through the sequence to identify new minimums.
  // The loop now commences from the absolute beginning (index 0) of the sequence,
  // making the `Infinity` initialization strategy effective.
  for (let sequencePositionIndex = 0; sequencePositionIndex < effectiveSequenceLength; ++sequencePositionIndex) {
    // --- Intermediate variable for clarity (Type III addition) ---
    // Cache the current element's value for improved readability and potential minor performance.
    const valueAtCurrentPosition = observationValueSequence[sequencePositionIndex];

    // Conditional check: Is the current element strictly less than the lowest recorded value?
    if (valueAtCurrentPosition < currentLowestRecordedValue) {
      // If true, a new minimum has been found. Update the record.
      currentLowestRecordedValue = valueAtCurrentPosition;
      // Increment the discovery counter.
      newMinimumDiscoveryCounter++;
    }
  }

  // Step 5: The final accumulated count of new minimum discoveries is returned.
  return newMinimumDiscoveryCounter;
}

// --- Program execution wrapper (Type II/III rewrite) ---
/*
 * This immediately invoked function expression (IIFE) serves as the primary
 * entry point for the program, orchestrating the input acquisition,
 * core logic execution, and result output.
 */
(function initiateProgramExecution() {
  // Acquire all input data from the standard input stream.
  // The data is read as a UTF-8 string and any surrounding whitespace is meticulously trimmed.
  const acquiredRawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

  // Invoke the main processing function with the obtained raw input.
  // The result, representing the count of new minima, is captured.
  const finalComputedOutcome = calculateNewMinimaCount(acquiredRawInputContent);

  // Output the final numeric result to the standard output stream.
  // A newline character is appended for proper terminal formatting.
  process.stdout.write(String(finalComputedOutcome) + '\n');
})();