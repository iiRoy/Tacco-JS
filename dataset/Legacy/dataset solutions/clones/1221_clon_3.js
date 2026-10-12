'use strict';
(function(rawInputData) {
  // Helper function to convert a string of space-separated numbers into an array of numbers.
  const extractNumericArray = (sourceString) => {
    return sourceString.split(' ').map(Number);
  };

  // Helper function to perform the sorting and joining operation.
  const processAndFormatNumbers = (numbersCollection) => {
    // The sort method modifies the array in place.
    // Since the original code re-parses the input for sorting,
    // we ensure 'numbersCollection' is a fresh array here.
    return numbersCollection.sort((firstElement, secondElement) => firstElement - secondElement).join(' ');
  };

  var inputLineSegments = rawInputData.split('\n');
  var primaryInputLine = inputLineSegments[0];

  // This variable mirrors the 'param' variable in the original,
  // which is initialized but not directly used for the final output.
  var initialParsedValues = extractNumericArray(primaryInputLine);

  // Crucially, the original code re-parses the input line for the sorting operation.
  // We must create a new array for sorting to maintain behavioral equivalence
  // (i.e., 'initialParsedValues' remains untouched).
  var valuesForSortingOperation = extractNumericArray(primaryInputLine);

  var finalFormattedOutput = processAndFormatNumbers(valuesForSortingOperation);

  console.log(finalFormattedOutput);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
