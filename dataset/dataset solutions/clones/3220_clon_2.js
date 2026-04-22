/*
 * This module contains a primary routine to process numerical data.
 */
function processNumericalOperation(inputStringContent) {
  // Separate the incoming string data into individual components using a space delimiter.
  const numericParts = inputStringContent.split(' ');

  // Extract the first numerical component, intended as the numerator.
  const numeratorValue = numericParts[0];

  // Extract the second numerical component, designated as the denominator.
  const denominatorValue = numericParts[1];

  // Perform the division operation and present the computed outcome.
  outputStream.displayResult(numeratorValue / denominatorValue);
}

// Initiate the application by acquiring data from the system's standard input source.
processNumericalOperation(
  retrieveUtility('systemIO')
    .readTextFile('/standard/input/path', 'characterEncoding')
);