'use strict';
// This module's purpose is to evaluate a specific numerical sequence condition.
(function(inputDataSource) {

  // A constant defining the expected number of numerical arguments.
  const EXPECTED_ARGUMENT_COUNT = 3;

  /**
   * Encapsulates the output mechanism for displaying results.
   * @param {string} displayString - The text string to be printed.
   */
  const emitResult = (displayString) => {
    console.log(displayString);
  };

  // Retrieve the raw input, convert it to a string, remove leading/trailing whitespace,
  // and then split it into individual string components based on spaces.
  const rawInputSegments = inputDataSource.toString().trim().split(' ');

  // Implement a guard clause to ensure the input data meets the structural requirements.
  if (rawInputSegments.length !== EXPECTED_ARGUMENT_COUNT) {
    emitResult("Input error: Insufficient or excessive data points detected.");
    // Terminate execution if the input format is invalid.
    return;
  }

  // Parse the string segments into numerical values.
  // The unary plus operator is employed for concise string-to-number type coercion.
  const firstNumericValue = +rawInputSegments[0]; // Corresponds to 'a' in the original logic.
  const secondNumericValue = +rawInputSegments[1]; // Corresponds to 'b' in the original logic.
  const thirdNumericValue = +rawInputSegments[2]; // Corresponds to 'c' in the original logic.

  // A boolean flag to store the outcome of the primary logical test.
  let isSequenceStrictlyAscending = false;

  // Evaluate if the sequence of numbers is strictly increasing.
  // This consolidates the nested conditional checks into a single expression.
  if (firstNumericValue < secondNumericValue && secondNumericValue < thirdNumericValue) {
    isSequenceStrictlyAscending = true;
  }

  // Based on the evaluation, determine the final message to be output.
  const conclusionMessage = isSequenceStrictlyAscending ? 'Yes' : 'No';

  // Present the final outcome to the user.
  emitResult(conclusionMessage);

  // Note: Additional logging or debugging information can be appended here,
  // typically removed in a production environment.
  // console.debug(`Evaluated values: [${firstNumericValue}, ${secondNumericValue}, ${thirdNumericValue}]`);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The input stream is sourced from standard input.