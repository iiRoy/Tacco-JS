'use strict';
/*
 * This module provides functionality to compute permutations of arrays.
 * It's structured as an Immediately Invoked Function Expression (IIFE).
 */
( function () {
  var computeArrangements = function ( collectedResults, currentCombination, remainingItems, depth ) {
    var chosenElement, loopIndex, partialArray, initialLength;
    if ( depth > 0 ) {
      for ( loopIndex = 0, initialLength = remainingItems.length; loopIndex < initialLength; ++loopIndex ) {
        partialArray = remainingItems.slice( 0 );
        chosenElement = partialArray.splice( loopIndex, 1 );
        computeArrangements( collectedResults, currentCombination.concat( chosenElement ), partialArray, depth - 1 );
      }
    } else {
      // Base case: add the complete combination to the results
      collectedResults.push( currentCombination );
    }
  };

  /*
   * Extends the native Array prototype with a custom method.
   * Example: [1, 2, 3].generateCombinations(2)
   * Result: [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]
   */
  Array.prototype.generateCombinations = function ( subsetSize ) {
    if ( subsetSize == null ) subsetSize = this.length; // Default to full array length
    var finalCombinations = [];
    computeArrangements( finalCombinations, [], this, subsetSize );
    return finalCombinations;
  };
} )();

const executeProcessing = rawInputLines => {
  // Parse the first line for an integer value (though not directly used later)
  const totalElementsCount = parseInt( rawInputLines[0] );

  // Process the second line into a sequence of numbers
  const sequenceA = rawInputLines[1].split( ' ' ).map( itemString => parseInt( itemString ) );

  // Process the third line into another sequence of numbers
  const sequenceB = rawInputLines[2].split( ' ' ).map( itemString => parseInt( itemString ) );

  // Convert number sequences to their string representations for comparison
  let stringA = sequenceA.join( '' );
  let stringB = sequenceB.join( '' );

  // Generate all possible permutations of sequenceA and convert them to strings
  let sortedPermutations = sequenceA.generateCombinations().map( combo => combo.join( '' ) );

  // Sort the generated permutation strings lexicographically
  sortedPermutations.sort();

  let indexA, indexB; // Variables to store the indices of stringA and stringB

  // Iterate through the sorted permutations to find the indices
  for ( let currentIndex = 0; currentIndex < sortedPermutations.length; currentIndex++ ) {
    if ( stringA === sortedPermutations[currentIndex] ) {
      indexA = currentIndex;
    }
    if ( stringB === sortedPermutations[currentIndex] ) {
      indexB = currentIndex;
    }
  }

  // Output the absolute difference between the found indices
  console.log( Math.abs( indexA - indexB ) );
};

// Read input from standard input, process it, and execute the main logic
executeProcessing( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).split( '\n' ) );