// This script processes numerical data from standard input to find a specific sum.
var rawData = require('fs') . readFileSync('/dev/stdin' , 'utf8' );

// Split the input into individual lines, removing any leading/trailing whitespace from the entire input.
var lineFragments = (rawData . trim()) . split("\n");

// Main processing loop continues until a specific termination condition is met.
while ( true ) {

  // Extract the first line, split it by space, and convert parts to numbers.
  var currentDimensions = lineFragments . shift() . split(" ") . map(Number);

  // Assign the first and second numerical values to distinct variables.
  var firstDimension = currentDimensions [0];
  var secondDimension = currentDimensions [1];

  // If both dimensions are zero, terminate the loop.
  if ( firstDimension === 0 && secondDimension === 0 ) {
    break ;
  }

  // Initialize an array to hold input values for the current test case.
  var valueList = [];

  // Populate the value list by reading 'firstDimension' lines and converting them to numbers.
  for ( var counterA = 0 ; counterA < firstDimension ; counterA++ ) {
    valueList . push ( lineFragments . shift() - 0 ); // The '- 0' ensures numeric conversion.
  }

  // Add a sentinel value to the end of the list, useful for specific algorithms.
  valueList.push( 0 );

  // Initialize a collection to store all possible sums of pairs from 'valueList'.
  var sumCollection = [ ];

  // Generate all unique pairs (including self-pairing) and calculate their sums.
  for ( var indexPrimary = 0 ; indexPrimary < valueList.length ; indexPrimary ++ ) {
    for ( var indexSecondary = indexPrimary ; indexSecondary < valueList . length ; indexSecondary ++ ) {
      sumCollection . push( valueList[indexPrimary] + valueList[indexSecondary] );
    }
  }

  // Sort the collection of sums in ascending order.
  sumCollection . sort( function( elementOne , elementTwo ) { return elementOne - elementTwo ; } );

  // Initialize the variable to track the maximum sum found so far, constrained by 'secondDimension'.
  var maximumPossibleSum = 0 ;

  // Iterate through the sorted sums to find the largest sum of two elements from 'sumCollection'
  // that does not exceed 'secondDimension'.
  for ( var outerIndex = 0 ; outerIndex < sumCollection . length ; outerIndex++ ) {
    for ( var innerIndex = outerIndex ; innerIndex < sumCollection . length ; innerIndex++ ) {
      var currentPairSum = sumCollection[outerIndex] + sumCollection[innerIndex] ;

      // If the current sum exceeds the limit, further sums in this inner loop will also exceed it (due to sorting).
      if ( currentPairSum > secondDimension ) {
        break ;
      }
      
      // Update the maximum sum if the current sum is larger.
      if ( maximumPossibleSum < currentPairSum ) {
        maximumPossibleSum = currentPairSum ;
      }
    }
  }
  // Output the determined maximum sum for the current test case.
  console . log ( maximumPossibleSum );
}