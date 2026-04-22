// Retrieve raw text data from standard input.
var rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input to get an array of individual lines.
var extractedLines = rawDataContent.trim().split('\n');

// Convert each line into an array of numbers, splitting by comma.
var parsedNumberArrays = extractedLines.map(
  function(currentLineSegment) {
    return currentLineSegment.split(',').map(
      function(numericToken) {
        return +numericToken;
      }
    );
  }
);

// Calculate the sum of products (first element * second element) for each pair.
var overallProductSum = parsedNumberArrays.reduce(
  function(accumulatedValue, dataPair) {
    return accumulatedValue + dataPair[0] * dataPair[1];
  },
  0
);

// Calculate the sum of the second elements from all pairs.
var secondElementSum = parsedNumberArrays.reduce(
  function(accumulatedValue, dataPair) {
    return accumulatedValue + dataPair[1];
  },
  0
);

// Output the weighted total and the rounded average of the second elements.
console.log(overallProductSum, Math.round(secondElementSum / parsedNumberArrays.length));