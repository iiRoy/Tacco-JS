"use strict" ; /* Enable strict mode for better error handling and cleaner code */


/*
 * This function performs a binary search on a sorted array to find the
 * insertion point for a target value.
 * It does not necessarily return the index of the target if it exists,
 * but rather the index where the target *would be* inserted to maintain order.
 */
const binarySearch = ( array , target ) => {
  // Initialize 'high' pointer to the last index of the array.
  let high = array . length - 1 ;
  // Initialize 'low' pointer to the first index of the array.
  let low  = 0 ;

  /*
   * The main binary search loop.
   * Continues as long as the 'low' pointer is less than the 'high' pointer.
   */
  while ( low < high ) {
    // Calculate the middle index. Using Math.floor ensures an integer index.
    let mid = Math . floor ( ( low + high ) / 2 ) ;

    // If the target is found at the middle index, return that index.
    if ( target === array [ mid ] ) {
      return mid ; /* Found an exact match */
    }

    // If the target is less than the value at the middle index,
    // narrow down the search to the lower half.
    if ( target < array [ mid ] ) {
      high = mid - 1 ; // Adjust 'high' to one position before 'mid'.
    }
    // Otherwise, the target is greater than the value at the middle index,
    // so narrow down the search to the upper half.
    else {
      low  = mid + 1 ; // Adjust 'low' to one position after 'mid'.
    }
  }

  // After the loop, 'low' and 'high' pointers have converged or crossed.
  // Determine the correct insertion point.

  // If the value at 'low' is less than the target, the target should be inserted after 'low'.
  if ( array [ low ] < target ) {
    return low + 1 ;
  }
  // If the value at 'low' is greater than or equal to the target,
  // the target should be inserted at or before 'low'.
  if ( array [ low ] >= target ) {
    return low ;
  }
  // Fallback return value, typically means an empty array or edge case not covered.
  return 0 ; // Default return value if no other condition is met.
}


/*
 * The main function to process input and calculate the final count.
 */
const main = arg => {
    // Split the input string by newline characters to get an array of lines.
    arg = arg . split ( "\n" ) ;

    // Parse the first line as an integer for N (though N is not used later in this snippet).
    const N = parseInt ( arg [ 0 ] ) ;

    // Process the second line: split by space, map to integers, and sort ascending.
    const top = arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) )
                . sort ( ( a , b ) => a - b ) ;
    // Process the third line: split by space, map to integers, and sort ascending.
    const mid = arg [ 2 ] . split ( " " ) . map ( n => parseInt ( n ) )
                . sort ( ( a , b ) => a - b ) ;
    // Process the fourth line: split by space, map to integers, and sort ascending.
    const low = arg [ 3 ] . split ( " " ) . map ( n => parseInt ( n ) )
                . sort ( ( a , b ) => a - b ) ;


    console . log ( top ) ; // Log the sorted 'top' array for debugging.
    console . log ( low ) ; // Log the sorted 'low' array for debugging.
    console . log ( "    " ) ; // Log some spaces for visual separation.


    let cnt = 0 ; // Initialize a counter variable.


    // Iterate through each element in the 'mid' array.
    for ( let i in mid ) {
        /*
         * Calculate 'topNum':
         * This finds the insertion point for mid[i] in the 'top' array.
         * Effectively, it counts how many elements in 'top' are less than or equal to mid[i].
         */
        let topNum = binarySearch ( top , mid [ i ] ) ;

        /*
         * Calculate 'lowNum':
         * This finds the insertion point for mid[i] in the 'low' array.
         * Then, it subtracts this from the total length of 'low' to get
         * how many elements in 'low' are greater than or equal to mid[i].
         */
        let lowNum = low . length - binarySearch ( low , mid [ i ] ) ;


        console . log ( binarySearch ( low , mid [ i ] ) ) ; // Debugging: log the low binary search result.


        console . log ( mid [ i ] + "以下が" + topNum + "個" ) ; // Log count of elements <= mid[i] in 'top'.
        console . log ( mid [ i ] + "以上が" + lowNum + "個" ) ; // Log count of elements >= mid[i] in 'low'.
        console . log ( "-----------" ) ; // Log a separator for readability.

        // Accumulate the product of topNum and lowNum to the total count.
        cnt += topNum * lowNum ;
    }


    console . log ( cnt ) ; // Log the final calculated total count.
}

// Read input from standard input, decode as UTF-8, and pass to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;