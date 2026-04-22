/* This module processes a series of tasks, generating permutations
 * and evaluating them based on specific criteria derived from input data. */

// A container to store all generated permutations for different sizes.
let permutationContainer = [ "" ];

// Iterate from 1 up to 10 to pre-generate permutations of indices.
for ( let currentSize = 1; currentSize <= 10; currentSize++ ) {
  // Initialize an array for permutations of the current size.
  permutationContainer[ currentSize ] = [];

  // Create a tracker for available elements for permutation generation.
  let selectionTracker = [];
  for ( let idx = 0; idx < currentSize; idx++ ) {
    selectionTracker[ idx ] = true; // Mark all elements as available initially.
  }

  // Define a recursive function to build permutations.
  const buildCombinations = function ( partialString ) {
    // Base case: If the partial string length matches the target size, store it.
    if ( partialString.length === currentSize ) {
      permutationContainer[ currentSize ].push( partialString );
    } else {
      // Recursive step: Try adding each available element.
      for ( let idx = 0; idx < currentSize; idx++ ) {
        if ( selectionTracker[ idx ] ) {
          selectionTracker[ idx ] = false; // Mark as used.
          buildCombinations( partialString + idx ); // Recurse with new element.
          selectionTracker[ idx ] = true; // Backtrack: Mark as available again.
        }
      }
    }
  };

  // Start the permutation generation process with an empty string.
  buildCombinations( "" );
}

// Read raw input from standard input.
const fileContent = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace and split into lines.
let dataLines = fileContent.trim().split( "\n" );

// Main processing loop: continues until a specific termination condition.
while ( true ) {
  // Extract the current problem size from the data lines.
  let itemCount = dataLines.shift() - 0; // Convert string to number.

  // Termination condition: if itemCount is 0, exit the loop.
  if ( itemCount === 0 ) break;

  // Initialize an array to store details about meal components.
  let mealItems = [];
  for ( let idx = 0; idx < itemCount; idx++ ) {
    mealItems[ idx ] = dataLines.shift().split( " " ); // Store name, weight, start_time.
  }

  // Initialize variables for tracking the best permutation.
  let minimumAverage = Infinity; // Stores the minimum average calculated so far.
  let optimalPermutationIdx;      // Stores the index of the best permutation.

  // Iterate over all permutations generated for the current itemCount.
  permutationContainer[ itemCount ].forEach( function ( permutationStr, entryPos ) {
    let accumulatedMass = 0;       // Accumulator for total weight.
    let tempWeightedSum = 0;       // Accumulator for weighted sum.
    let sequencePassesCheck = true; // Flag to track if the sequence is valid.

    // Evaluate each item in the current permutation.
    for ( let idx = 0; idx < itemCount; idx++ ) {
      let itemReference = permutationStr[ idx ] - 0; // Get the index of the dish.
      let weightMeasure = mealItems[ itemReference ][ 1 ] - 0; // Get dish weight.
      let initialTime = mealItems[ itemReference ][ 2 ] - 0;   // Get dish start time.

      // Check if the accumulated mass exceeds the dish's start time.
      if ( accumulatedMass > initialTime ) {
        sequencePassesCheck = false; // Mark sequence as invalid.
        break; // No need to check further for this sequence.
      }
      accumulatedMass += weightMeasure;           // Update total mass.
      tempWeightedSum += weightMeasure * ( itemCount - idx ); // Update weighted sum.
    }

    // If the sequence was invalid (failed the time check at least once).
    if ( !sequencePassesCheck ) {
      let currentAverage = tempWeightedSum / accumulatedMass; // Calculate average.

      // Update minimum average if the current one is better.
      if ( minimumAverage > currentAverage ) {
        optimalPermutationIdx = entryPos; // Store index of this better permutation.
        minimumAverage = currentAverage;  // Update the minimum average.
      }
    }
  } );

  // Retrieve the optimal permutation string.
  let bestSequence = permutationContainer[ itemCount ][ optimalPermutationIdx ];

  // Process and print the names of the dishes in the optimal sequence.
  bestSequence.split( "" ).map( Number ).reverse().forEach( function ( dishRef ) {
    console.log( mealItems[ dishRef ][ 0 ] ); // Print the dish name.
  } );
}