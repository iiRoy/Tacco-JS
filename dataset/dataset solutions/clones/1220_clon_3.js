// This script processes numerical input from standard input
// and evaluates a specific comparison condition.

(function(inputBufferHandle) {
  // Define constants for clarity and potential reuse across the script.
  // These are string literals and paths used in the processing.
  const standardInputFilePath = '/dev/stdin'; // The source of numerical data.
  const lineSeparator = '\n';                 // Delimiter for lines in the input.
  const numberSeparator = ' ';                // Delimiter for numbers within a line.
  const positiveOutcomeLabel = 'Yes';         // Output for a true condition.
  const negativeOutcomeLabel = 'No';          // Output for a false condition.
  const minimumExpectedArguments = 3;         // Number of numerical arguments expected.

  // Step 1: Convert the raw buffer received from standard input into a usable string format.
  // The 'utf8' encoding is specified for explicit character handling.
  let rawInputStringData = inputBufferHandle.toString('utf8');

  // Step 2: Extract the first line of numerical input.
  // This involves splitting the entire input by newlines and taking the very first segment.
  let primaryInputLine = rawInputStringData.split(lineSeparator)[0];

  // Step 3: Parse the numerical values from the extracted line.
  // The line is split by spaces, and each resulting string segment is converted to a number.
  // A robust mapping function handles potential non-numeric values by defaulting them to 0.
  let collectedNumericParameters = primaryInputLine.split(numberSeparator).map(segment => {
    const numericValue = Number(segment);
    // If conversion results in NaN, we treat it as 0 to ensure continuity in processing.
    return isNaN(numericValue) ? 0 : numericValue;
  });

  // Step 4: Validate the number of collected parameters.
  // This is a guard clause added for robustness (Type III modification).
  // If fewer than the expected number of arguments are found, the array is padded with zeros.
  if (collectedNumericParameters.length < minimumExpectedArguments) {
    console.warn(`Warning: Fewer than ${minimumExpectedArguments} numerical arguments provided. Padding with zeros.`);
    while (collectedNumericParameters.length < minimumExpectedArguments) {
      collectedNumericParameters.push(0);
    }
  }

  // Step 5: Assign the first three numerical parameters to distinct variables for clarity.
  // These variables will be used in the core comparison logic.
  let valueOne = collectedNumericParameters[0];
  let valueTwo = collectedNumericParameters[1];
  let valueThree = collectedNumericParameters[2];

  // Step 6: Define a helper function to encapsulate the output logic.
  // This function takes a boolean and logs the corresponding label to the console.
  const printEvaluationResult = (isConditionMet) => {
    if (isConditionMet) {
      console.log(positiveOutcomeLabel);
    } else {
      console.log(negativeOutcomeLabel);
    }
  };

  // Step 7: Execute the core comparison logic, replicating JavaScript's specific evaluation.
  // The original condition `a < b < c` is evaluated as `(a < b) < c`.
  // First, `valueOne < valueTwo` is evaluated, resulting in a boolean (true or false).
  let firstComparisonOutcome = (valueOne < valueTwo);

  // Second, the boolean result from the first comparison is implicitly coerced to a number (1 for true, 0 for false).
  // This numeric value (0 or 1) is then compared against `valueThree`.
  let finalComparisonStatus = (firstComparisonOutcome < valueThree);

  // Step 8: Display the final outcome using the dedicated helper function.
  printEvaluationResult(finalComparisonStatus);

// The `require('fs').readFileSync('/dev/stdin')` call synchronously reads the entire content
// of the standard input stream and passes it as a Buffer to the outer IIFE.
}(require('fs').readFileSync('/dev/stdin')));