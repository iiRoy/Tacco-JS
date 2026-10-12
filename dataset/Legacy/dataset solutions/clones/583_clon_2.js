var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
  // Extract dimensions from the first line segment
  var dimensions = lineSegments.shift().split(" ").map(Number);
  var firstDim = dimensions[0];
  var secondDim = dimensions[1];

  // Check for termination condition
  if (firstDim === 0 && secondDim === 0) {
    break;
  }

  // Populate a list of values
  var valueList = [];
  for (var idxA = 0; idxA < firstDim; idxA++) {
    valueList.push(lineSegments.shift() - 0); // Convert string to number
  }
  valueList.push(0); // Add a zero to the list

  // Generate all possible sums of two elements from valueList
  var sumPairs = [];
  for (var idxB = 0; idxB < valueList.length; idxB++) {
    for (var idxD = idxB; idxD < valueList.length; idxD++) {
      sumPairs.push(valueList[idxB] + valueList[idxD]);
    }
  }

  // Sort the generated sums in ascending order
  sumPairs.sort(function(valX, valY) {
    return valX - valY;
  });

  // Filter out duplicate sums, keeping only unique values
  var lastUnique = -1;
  sumPairs = sumPairs.filter(function(currentVal) {
    if (lastUnique !== currentVal) {
      lastUnique = currentVal;
      return true; // Keep this unique value
    }
    return false; // Discard duplicate
  });

  // Find the largest sum of two unique sums that does not exceed secondDim
  var greatestSum = 0;
  for (var idxC = 0; idxC < sumPairs.length; idxC++) {
    for (var idxE = idxC; idxE < sumPairs.length; idxE++) {
      var currentTotal = sumPairs[idxC] + sumPairs[idxE];

      // If the current total exceeds the limit, no further sums with sumPairs[idxC] will be valid
      if (currentTotal > secondDim) {
        break;
      }

      // Update the greatest sum found so far
      if (greatestSum < currentTotal) {
        greatestSum = currentTotal;
      }
    }
  }

  // Output the result for the current test case
  console.log(greatestSum);
}
