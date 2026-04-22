'use strict';

(function ( rawInputString ) {
  // Normalize the raw input string: remove leading/trailing whitespace,
  // split into individual string tokens by any sequence of whitespace,
  // then convert each token into a numerical value.
  let numericSequence = rawInputString . trim ( ) . split ( / \s+ / ) . map (  numStr  =>  numStr  -  0  ) ;

  // The very first number in the processed sequence denotes the overall count
  // of elements to be considered in the subsequent data set.
  const elementCount = numericSequence . shift ( ) ;

  // The remaining numbers now constitute the primary data array for computations.
  const dataPoints = numericSequence ;

  // Establish a boundary condition or sentinel value for negative indexing,
  // which is sometimes used in specific dynamic programming patterns.
  dataPoints [ -1 ] = 0 ;

  // Initialize a two-dimensional array, often referred to as a memoization table
  // or a dynamic programming grid, to store intermediate results.
  // Its dimensions are (elementCount + 1) by (elementCount + 1 - current_row_index).
  const scoreGrid = new Array ( elementCount + 1 )
                      . fill ( 0 )
                      . map ( ( rowPlaceHolder , rowIndex ) =>
                        new Array ( elementCount + 1 - rowIndex ) . fill ( 0 )
                      ) ;

  // Explanation: scoreGrid[len][idx] stores the optimal outcome for a sub-sequence
  // of 'len' items, starting at 'idx' in the original dataPoints array.
  // The ultimate solution will be found at scoreGrid[elementCount][0].

  // Begin filling the scoreGrid using an iterative approach.
  // The outer loop advances through possible sub-sequence lengths.
  for ( let currentLength = 1 ; currentLength <= elementCount ; currentLength ++ ) {
    // The inner loop iterates through all possible starting indices for a sub-sequence
    // of the 'currentLength' being processed.
    for ( let startIndex = 0 ; startIndex <= elementCount - currentLength ; startIndex ++ ) {
      // The core dynamic programming recurrence relation:
      // Each cell's value is determined by taking the maximum of two choices:
      // 1. Selecting the last item of the current sub-sequence
      //    (dataPoints[currentLength + startIndex - 1]) and subtracting the
      //    score from the remaining sub-sequence.
      // 2. Selecting the first item of the current sub-sequence
      //    (dataPoints[startIndex]) and subtracting the score from the
      //    remaining sub-sequence (which starts one position later).
      scoreGrid [ currentLength ] [ startIndex ] = Math . max (
        dataPoints [ currentLength + startIndex - 1 ] - scoreGrid [ currentLength - 1 ] [ startIndex ] ,
        dataPoints [ startIndex ] - scoreGrid [ currentLength - 1 ] [ startIndex + 1 ]
      ) ;
    }
  }

  // Once the scoreGrid is fully populated, the final computed result,
  // representing the optimal difference for the entire sequence, is
  // located at scoreGrid[elementCount][0].
  const finalResult = scoreGrid [ elementCount ] [ 0 ] ;

  // console.dir(scoreGrid, { depth: null }); // Optional: for detailed inspection of the computed grid during debugging.

  // Output the derived final result to the standard output stream.
  console . log ( finalResult ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;