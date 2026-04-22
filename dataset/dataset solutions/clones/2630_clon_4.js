'use strict';

(function() {
  const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Extract the second line using manual string operations to avoid direct 'split'
  let firstNewlinePosition = sourceContent.indexOf('\n');
  let secondNewlinePosition = sourceContent.indexOf('\n', firstNewlinePosition + 1);
  let relevantSegment;

  if (firstNewlinePosition === -1) {
      // If no newline, consider there's no second line, or it's empty
      relevantSegment = "";
  } else if (secondNewlinePosition === -1) {
      // If only one newline, the rest of the string is the second line
      relevantSegment = sourceContent.substring(firstNewlinePosition + 1);
  } else {
      // If multiple newlines, extract the content between the first and second
      relevantSegment = sourceContent.substring(firstNewlinePosition + 1, secondNewlinePosition);
  }

  // Mimic splitting by space and converting to numbers, without using 'split' or 'map' functions
  const tokensCollection = [];
  let currentTokenFragment = '';
  for (let positionMarker = 0; positionMarker < relevantSegment.length; positionMarker++) {
    const unitCharacter = relevantSegment[positionMarker];
    if (unitCharacter === ' ') {
      tokensCollection.push(currentTokenFragment);
      currentTokenFragment = '';
    } else {
      currentTokenFragment += unitCharacter;
    }
  }
  // Add the last token after the loop
  tokensCollection.push(currentTokenFragment);

  // Convert collected string tokens into numeric values
  const numericContainer = [];
  for (let valueIndex = 0; valueIndex < tokensCollection.length; valueIndex++) {
    const stringRepresentation = tokensCollection[valueIndex];
    // Using unary plus operator for conversion, similar to Number()
    numericContainer.push(+stringRepresentation);
  }

  // Define a recursive function to compute the sum of reciprocals
  function computeReciprocalTotal(dataItems, currentSpot) {
    if (currentSpot >= dataItems.length) {
      return 0; // Base case: end of array, sum is 0
    }
    // Recursive step: add reciprocal of current item and sum of the rest
    return (1 / dataItems[currentSpot]) + computeReciprocalTotal(dataItems, currentSpot + 1);
  }

  const finalInverseSum = computeReciprocalTotal(numericContainer, 0);

  // Output the reciprocal of the final sum
  console.log(1 / finalInverseSum);
})();