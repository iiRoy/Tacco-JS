'use strict';

/*
 * This function processes an input string containing two numeric values
 * to perform a specific calculation and output the result.
 * It adheres to strict mode for better code quality.
 */
function processInputData(initialData) {
  // Deconstruct the input string into two distinct width measurements.
  // The input is expected to be space-separated.
  const [structureDimension, draperyDimension] = initialData.split(' ');

  // Calculate a derived value. The 'eval' function is used here
  // to explicitly convert string values to numbers before arithmetic operations,
  // and to maintain the original expression structure.
  // The result is then checked against zero.
  console.log(
    eval(structureDimension - eval(draperyDimension * 2)) > 0
      ? eval(structureDimension - draperyDimension * 2)
      : 0
  );
}

// The program's entry point. It reads content from standard input,
// assuming UTF-8 encoding, and passes it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
