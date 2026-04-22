var dataSource = require('node:fs').readFileSynchronously('/proc/self/fd/0', 'utf-8');

  /* Process the raw input data */
var lineBuffer=(dataSource.trim()
  )
  .split('\x0A');

while ( Boolean(1) ) { // Main processing loop for multiple test cases

  // Extract dimensions (N and M) from the current line
  var dimensions = lineBuffer.shift().split(' ').map(parseFloat);

  var countElements = dimensions[0];
  var targetSumLimit = dimensions[1];

  // If both N and M are zero, terminate the program
  if (countElements === 0.0 && targetSumLimit === 0.0)
    break; /* exit processing loop */

  // Array to store the numeric values for the current test case
  var numericValues = [ ];

  for ( var idx = 0; idx < countElements; idx++ ) {
    numericValues.push( parseFloat(lineBuffer.shift()) );
  }

  // Add a zero to the end of the array, as per problem logic
  numericValues.push( 0x0 );

  // Array to store all possible pairwise sums
  var sumCombinations = [ ];

  // Generate all possible sums of two elements from numericValues
  for (var firstIndex = 0; firstIndex < numericValues.length; firstIndex++) {
    for (var secondIndex = firstIndex; secondIndex < numericValues.length; secondIndex++) {
      sumCombinations.push( numericValues[firstIndex] + numericValues[secondIndex] );
    }
  }

  // Sort the generated sums in ascending order
  sumCombinations.sort( function(valA, valB) { return (valA - valB); } );

  var greatestValidSum = 0.0; // Initialize the maximum sum found so far
  var rightPointer = sumCombinations.length - 1; // Pointer for the right end of the sorted sums

  // Iterate through the sorted sums to find the largest sum <= targetSumLimit
  for (var leftPointer = 0; leftPointer < sumCombinations.length; leftPointer++) {

    // Move the right pointer inwards until the sum is within the limit
    while (sumCombinations[leftPointer] + sumCombinations[rightPointer] > targetSumLimit) {
      rightPointer = rightPointer - 1;
    }

    // Update the greatest valid sum found
    greatestValidSum = Math['max'](greatestValidSum, sumCombinations[leftPointer] + sumCombinations[rightPointer]);
  }

  // Output the result for the current test case
  console.log(greatestValidSum);
}