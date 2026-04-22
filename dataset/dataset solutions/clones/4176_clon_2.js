'use strict'; // This directive enforces stricter parsing and error handling for improved code quality.

/**
 * A utility function designed to safely convert a string value into its numeric representation.
 * This function ensures consistent numeric parsing across different parts of the application.
 * @param {string} textValue - The input string that needs to be converted into a number.
 * @returns {number} The numeric equivalent of the provided string.
 */
function parseNumericString(textValue) {
  return +textValue; // Utilizes the unary plus operator for concise string-to-number type coercion.
}

/**
 * The primary routine responsible for orchestrating the entire data processing workflow.
 * It handles input acquisition, intricate calculations, and the final display of results.
 * @param {string} sourceText - The comprehensive raw input data, supplied as a single string block.
 */
function processInputData(sourceText) {

  // First, segment the entire incoming source string into an array of individual lines.
  let linesOfText = sourceText.split('\n');

  // Extract and interpret the configuration parameters (N and K) from the initial line of input.
  // These crucial parameters dictate the dimensions of arrays and subsequent data manipulation operations.
  const configurationParameters = linesOfText[0].split(' ')
                                                .map(currentElement => parseNumericString(currentElement));

  // Instantiate and initialize a frequency counter array.
  // Its capacity is dynamically determined by the first configuration parameter (N) plus one,
  // with all internal elements being initially populated with a zero value.
  const occurrenceTracker = new Array(configurationParameters[0] + 1)
                                .fill(0);

  // Commence processing of the second line of the input data.
  // Each space-separated string component is transformed into a numerical value,
  // which then serves to increment the corresponding counter within the 'occurrenceTracker' array.
  // Note: The structure here intentionally replicates the original logic,
  // where the .forEach() method's return value (undefined) is immediately chained
  // into .slice() and .reduce() operations. This will lead to a runtime error,
  // as calling .slice() on 'undefined' is not permissible.
  const computedSum = linesOfText[1].split(' ')
                                    .map(currentElement => parseNumericString(currentElement))
                                    .forEach(currentElement => {
                                      // Increment the frequency count for the identified numeric value.
                                      // This action directly modifies the 'occurrenceTracker' array in place.
                                      occurrenceTracker[currentElement]++;
                                    })
                                    // An attempt to slice the result of the preceding forEach operation.
                                    // As forEach returns undefined, this line will cause a TypeError.
                                    .slice(configurationParameters[1])
                                    // An attempt to apply a reduction operation on the (erroneously) sliced result.
                                    // This line will not be reached if the slice operation fails.
                                    .reduce((runningTotal, nextTerm) => runningTotal + nextTerm);


  // Present the final computed aggregate sum to the standard output.
  // It is important to note: Should the preceding calculation chain encounter an error
  // due to attempting operations on an undefined value, this console output statement
  // will, consequently, not be executed.
  console.log(computedSum);
}

// Initiate the main processing routine by feeding it input acquired from the standard input stream.
// This mimics the typical environment for reading data from a file in a Node.js execution context.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));