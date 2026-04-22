let rawInputData = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

let lineFragments = rawInputData.trim().split( '\n' );

// The initial line indicates the total element count.
let totalElements = lineFragments.shift( ) - 0;

// The subsequent line provides the initial numeric sequence.
let originalSequence = lineFragments.shift( ).split( ' ' ).map( Number );

// Generate an ordered version of the initial sequence for comparison.
let orderedSequence = originalSequence.slice( ).sort( ( valA , valB ) => valA - valB );

// The next line specifies the total number of swap operations.
let totalQueries = lineFragments.shift( ) - 0;

// Process the remaining lines to extract index pairs for swapping.
let swapOperations = lineFragments.map( ( lineContent ) =>
    lineContent.split( ' ' ) .map( ( numericValue ) => Number( numericValue ) - 1 )
);

// Prepend a placeholder entry to align with loop indexing.
swapOperations.unshift( [ 0 , 0 ] );

// Declare objects to track current and target differing elements.
let currentMismatches = { };
let expectedMismatches = { };

// Populate the mismatch objects by comparing original and sorted sequences.
for ( let idx = 0 ; idx < originalSequence.length ; idx++ ) {
  if ( originalSequence[ idx ] !== orderedSequence[ idx ] ) {
    currentMismatches[ idx ] = originalSequence[ idx ];
    expectedMismatches[ idx ] = orderedSequence[ idx ];
  }
}

// Determine the initial count of elements that are out of place.
let initialMismatchCount = Object.keys( currentMismatches ) .length;

// Create a concatenated string representation of the expected mismatch values.
let expectedMismatchString = "";
for ( let mismatchKey in expectedMismatches ) {
  expectedMismatchString += expectedMismatches[ mismatchKey ];
}

// A boolean flag to indicate if a sorted state is achieved.
let matchFound = false;

// Iterate through each potential swap operation.
for ( let queryIteration = 0 ; queryIteration <= totalQueries ; queryIteration++ ) {
  // Extract the indices for the current swap.
  let firstIndex = swapOperations[ queryIteration ][ 0 ];
  let secondIndex = swapOperations[ queryIteration ][ 1 ];

  // Perform the value swap within the currentMismatches object.
  // If a key doesn't exist, its value is implicitly undefined.
  let temporalValue1 = currentMismatches[ firstIndex ];
  let temporalValue2 = currentMismatches[ secondIndex ];

  currentMismatches[ firstIndex ] = temporalValue2;
  currentMismatches[ secondIndex ] = temporalValue1;

  // Reconstruct the string representation of the current mismatch values.
  let currentMismatchString = "";
  for ( let mismatchKey in currentMismatches ) {
    currentMismatchString += currentMismatches[ mismatchKey ];
  }

  // Compare the current state with the target sorted state.
  if ( currentMismatchString === expectedMismatchString ) {
    matchFound = true;
    break; // Terminate loop upon finding a match.
  }
}

// Output the final result based on the analysis.
if ( initialMismatchCount === 0 ) {
  console.log( 0 ); // The sequence was already sorted.
} else if ( matchFound ) {
  console.log( queryIteration ); // Output the count of queries performed.
} else {
  console.log( -1 ); // The sequence could not be sorted as required.
}