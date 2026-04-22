// This is the main entry point of the program.
function main ( _stdin ) {
  // Process the raw input string.
  const stdin = _stdin . trim () . split ( '\n' ) ;

  // Extract the number of elements (n) from the input.
  const n = Number ( stdin . shift () ) ;

  // Extract the array A from the input, converting elements to numbers.
  const A = stdin . shift () . split ( ' ' ) . map ( Number ) ;


  // Call the partition function to rearrange the array.
  const a = partition ( A , 0 , n ) ;

  // Output the modified array to the console, joined by spaces.
  console . log ( a . join ( ' ' ) ) ;
}

/**
 * Partitions an array A around a pivot element.
 * This implementation seems to modify the array in-place.
 * @param {Array<number>} A The array to partition.
 * @param {number} left The starting index of the partition.
 * @param {number} right The ending index (exclusive) of the partition.
 * @returns {Array<number>} The partitioned array.
 */
function partition ( A , left , right ) {
  // Choose the last element of the sub-array as the pivot.
  let x = A [ right - 1 ] ;

  // 'lower' tracks the boundary between elements less than or equal to the pivot,
  // and elements greater than the pivot.
  let lower = left ;

  // Iterate through the sub-array from 'left' up to (but not including) the pivot.
  for ( let i = left , l = right - 1 ; i < l ; i ++ ) {
    // If an element is less than or equal to the pivot,
    // swap it with the element at the 'lower' position.
    if ( A [ i ] <= x ) {
      let t = A [ i ] ;
      A [ i ] = A [ lower ] ;
      A [ lower ] = t ;
      lower ++ ; // Increment 'lower' to extend the "less than or equal" section.
    }
  }

  // After the loop, 'lower' is the correct position for the pivot.
  // Swap the pivot (originally at A[right - 1]) with the element at A[lower].
  let t = A [ lower ] ;
  A [ right - 1 ] = t ;

  // The original pivot value needs to be wrapped in square brackets.
  // This is a specific requirement of the problem this code solves.
  x = `[${ x }]` ;

  A [ lower ] = x ; // Place the bracketed pivot into its final sorted position.

  // Return the modified array.
  return A ;
}

// Execute the main function with input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;