/*
 * This file contains a JavaScript program.
 * It defines two main functions: `sort` and `main`.
 */

// Function to sort an array in descending order.
// This is a custom sort implementation based on the comparison function.
function sort ( arr ) {
  // The Array.prototype.sort() method is used here.
  // The comparison function (a, b) => b < a results in descending order.
  return arr . sort ( ( a , b ) => b < a )
}

/*
 * The main function processes the input data.
 * It reads numbers, sorts them, and then performs a counting operation.
 */
function main ( input ) {
  // Split the input string by newline characters to get individual lines.
  const args = input . split ( '\n' )

  // The first argument is 'n', which represents the size of the arrays.
  const n = args [ 0 ] ;

  // Process the second line of input for the 'top' array.
  // It splits by space, maps to Number, and then sorts.
  const top = sort ( args [ 1 ] . split ( ' ' ) . map ( n => Number ( n ) ) )
  // Process the third line of input for the 'center' array.
  const center = sort ( args [ 2 ] . split ( ' ' ) . map ( n => Number ( n ) ) )
  // Process the fourth line of input for the 'bottom' array.
  const bottom = sort ( args [ 3 ] . split ( ' ' ) . map ( n => Number ( n ) ) )


  // Initialize a counter for the valid combinations.
  var count = 0 ;
  // Declare loop variables.
  var i , j , k ;

  // Outer loop iterates through the 'top' array.
  for ( i = 0 ; i < n ; i ++ ) {
    // Middle loop iterates through the 'center' array.
    for ( j = 0 ; j < n ; j ++ ) {
      // Inner loop iterates through the 'bottom' array.
      for ( k = 0 ; k < n ; k ++ ) {
        // Check the condition: top[i] < center[j] < bottom[k].
        if ( top [ i ] < center [ j ] && center [ j ] < bottom [ k ] ) {
          // If the condition is met, increment the counter.
          count += 1 ;
        }
      }
    }
  }

  // Output the final count to the console.
  console . log ( count )
}

// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) )