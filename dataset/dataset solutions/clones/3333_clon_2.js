'use strict';
( function ( dataString ) {
  // First, process the incoming raw text:
  // - Trim leading/trailing whitespace.
  // - Split by any sequence of whitespace characters.
  // - Convert each resulting string segment into a numerical value.
  dataString = dataString.trim().split( /\s+/ ).map( ( item ) => Number( item ) );

  // The initial number in the processed array represents the total count of elements.
  const elementCount = dataString.shift();

  // The remaining numbers form our primary collection for computations.
  const valueCollection = dataString;

  // A special boundary value is set at a non-existent index to simplify calculations.
  valueCollection[ -1 ] = 0;

  // Initialize a two-dimensional array (dynamic programming table) for memoization.
  // The dimensions are (elementCount + 1) by (elementCount + 1 - row_index).
  // Each cell `calculationGrid[length][startIndex]` will store a derived value.
  const calculationGrid = new Array( elementCount + 1 )
    .fill( null )
    .map( ( _, currentIdx ) => {
      return Array.from( {
        length: elementCount + 1 - currentIdx
      }, () => 0 );
    } );

  // The ultimate solution will be located at calculationGrid[elementCount][0].
  // This grid facilitates finding optimal results for sub-sequences.

  // Loop through all possible lengths for sub-sequences, starting from 1 up to the total count.
  for ( let subSequenceLength = 1; subSequenceLength <= elementCount; subSequenceLength++ ) {
    // For each length, iterate through all possible starting positions within the collection.
    for ( let startPosition = 0; startPosition <= elementCount - subSequenceLength; startPosition++ ) {
      // Compute the value for the current sub-problem using values from previously solved smaller sub-problems.
      // The logic determines the maximum of two scenarios:
      // 1. Taking the last element of the current sub-sequence minus the result of the previous sub-sequence
      //    (which excludes the last element but starts at the same position).
      // 2. Taking the first element of the current sub-sequence minus the result of the previous sub-sequence
      //    (which excludes the first element and starts one position later).
      calculationGrid[ subSequenceLength ][ startPosition ] = Math.max(
        valueCollection[ startPosition + subSequenceLength - 1 ] - calculationGrid[ subSequenceLength - 1 ][ startPosition ],
        valueCollection[ startPosition ] - calculationGrid[ subSequenceLength - 1 ][ startPosition ]
      );
    }
  }

  // Retrieve the final computed optimal value, which represents the solution for the entire sequence.
  const finalOutcome = calculationGrid[ elementCount ][ 0 ];

  // Display the determined final outcome to the standard output stream.
  console.log( finalOutcome );

} )( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) );