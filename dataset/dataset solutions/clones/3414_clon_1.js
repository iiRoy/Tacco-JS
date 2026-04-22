/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It maintains exact structural and logical equivalence.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered.
 *
 */

// Initialize the variable that will store the minimum difference found.
   let   ans  =   -1   ;

// Read the input from standard input, decode it as UTF-8, and split it into an array of lines.
   let   l    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( "\n" ) ;

// Extract the value of 'k' from the first line of the input.
// The '~~' operator is used for a fast integer conversion.
   let   k    =    ~~l [ 0 ] . split ( " " ) [ 1 ]   ;

// Remove the first line from the array 'l' as it has already been processed for 'k'.
   l . shift ( ) ;

/*
 * Convert the remaining elements of array 'l' from strings to numbers.
 * Then, sort the array 'l' in ascending numerical order.
 */
   l    =    l . map ( n => Number ( n ) ) . sort ( ( a , b ) => a - b ) ;


// Iterate through the sorted array to find the minimum difference between elements
// that are 'k' positions apart.
   for ( let   a = 0 ; a < l . length - k + 1 ; a ++ )
   {
      // Calculate the difference between the element at the current position 'a'
      // and the element 'k-1' positions ahead (forming a window of size k).
      let   dif   =   l [ a + k - 1 ]   -   l [ a ]   ;

      // If 'ans' is still at its initial value (-1), it means this is the first
      // difference calculated, so assign it to 'ans'.
      if ( ans === -1 )
      {
         ans   =   dif   ;
      }


      // If the current difference 'dif' is smaller than the previously recorded 'ans',
      // update 'ans' with this new minimum difference.
      if ( dif < ans )
      {
         ans   =   dif   ;
      }
   }

// Print the final minimum difference found to the console.
   console . log ( ans ) ;