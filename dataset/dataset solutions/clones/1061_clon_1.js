/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, expressions, and logic are preserved exactly.
 * Only whitespace and comments have been modified.
 * This file processes numeric input from a stream and sorts it using a merge sort algorithm,
 * then outputs a count of inversions.
 */

// Original config for Windows environments, currently commented out.
// config = { input: 'tmp', newline: '\r\n' }; // win

config  =  {  input :  '/dev/stdin'  ,  newline :  '\n'  }  ;  //  linux configuration active

stream  =  require ( 'fs' ) . createReadStream ( config . input ) ;


sum     =     0     ;     // Accumulates the current number being parsed
prev    =     false ;     // Flag to indicate if the previous character was a digit
A       =     [ ]   ;     // Array to store the parsed numbers


stream . on ( 'readable' ,  function ( )  {

    // Declare local variables for the readable event handler.
    var   buf  ,  i  ;

    buf   =   stream . read ( ) ;

    // If no data is available, exit the handler.
    if  (  buf  ===  null  )
        return  ;

    // This section searches backwards from the end of the buffer
    // to find the last newline character (0x0a).
    // This is to handle cases where a number might be split across buffer reads.
    // It limits the search to a maximum of 20 characters for efficiency.
    for  (  i  =  Math . min ( 20  ,  buf . length  -  1 )  ;
           i  >  0  &&  buf [ i - 1 ]  !==  0x0a  ;
           i --
         )
        ; // The loop body is intentionally empty.

    // Process each byte in the buffer, starting from 'i' (after the potential partial line).
    for  (  ;  i  <  buf . length  ;  i ++  )  {

        // Check if the current byte represents a digit (ASCII '0' through '9').
        if  (  buf [ i ]  >=  0x30  &&  buf [ i ]  <=  0x39  )  {

            // If it's a digit, update the current sum.
            sum   =   10  *  sum  +  (  buf [ i ]  -  0x30  )  ;
            prev  =  true  ; // Set flag indicating a digit was just processed.

        }  else  {

            // If it's not a digit and a number was being accumulated, push it to array A.
            if  (  prev  )
                A . push ( sum ) ;

            // Reset sum and prev flag for the next number.
            sum   =   0     ;
            prev  =   false ;

        }
    }
} ) ;


stream . on ( 'end' ,  function ( )  {

    var   B     ; // Declare a temporary array B.

    // If a number was being accumulated when the stream ended, add it to A.
    if  (  prev  )
        A . push ( sum ) ;

    // Create a shallow copy of array A into B.
    // This is crucial for the merge sort implementation as it uses two arrays
    // for swapping roles during recursion.
    B   =   [ ] . concat ( A ) ;

    // Perform the sort and print the result (inversion count).
    console . log ( sort ( A , B , 0 , A . length ) ) ;

} ) ;


/**
 * Implements a merge sort algorithm to sort the 'ary' array,
 * using 'smaller' as a temporary buffer during merges.
 * It also counts the number of inversions.
 *
 * @param {Array} ary The array to be sorted (and modified in place during merges).
 * @param {Array} smaller A temporary array used for merging.
 * @param {number} start The starting index of the current subarray.
 * @param {number} end The ending index (exclusive) of the current subarray.
 * @returns {number} The count of inversions in the subarray.
 */
function   sort ( ary ,  smaller ,  start ,  end )   {

    var   cnt  ,  tmp  ,  mid  ,  i  ,  j  ,  k  ; // Declare local variables.

    // Base case: If the subarray has 0 or 1 element, it's already sorted.
    if  (  end  -  start  <=  1  )
        return  0  ;

    // Base case: If the subarray has exactly 2 elements, perform a simple swap if needed.
    if  (  end  -  start  ===  2  )  {

        if  (  ary [ start ]  >  ary [ start + 1 ]  )  {

            tmp           =  ary [ start + 1 ] ;
            ary [ start + 1 ] =  ary [ start ]   ;
            ary [ start ]     =  tmp             ;
            return  1  ; // One inversion found.

        }
        return  0  ; // No inversions.
    }

    cnt   =   0   ; // Initialize inversion counter.

    // Calculate the middle point for splitting the array.
    mid   =   Math . floor ( ( start  +  end )  /  2 ) ;

    // Recursively sort the left half, swapping roles of 'ary' and 'smaller'.
    cnt   +=   sort ( smaller ,  ary ,  start ,  mid ) ;
    // Recursively sort the right half, swapping roles of 'ary' and 'smaller'.
    cnt   +=   sort ( smaller ,  ary ,  mid ,  end ) ;

    // Merge the two sorted halves back into 'ary'.
    i   =   start  ,  j   =   mid  ; // Pointers for the left and right subarrays.

    // Iterate through the entire subarray range.
    for  (  k  =  start  ;  k  <  end  ;  k ++  )  {

        // If the left subarray is exhausted.
        if  (  i  ===  mid  )  {

            ary [ k ]   =   smaller [ j ++ ] ; // Take from the right subarray.

        }
        // Else if the right subarray is exhausted.
        else  if  (  j  ===  end  )  {

            ary [ k ]   =   smaller [ i ++ ] ; // Take from the left subarray.

        }
        // Else if the element from the left subarray is smaller.
        else  if  (  smaller [ i ]  <  smaller [ j ]  )  {

            ary [ k ]   =   smaller [ i ++ ] ; // Take from the left subarray.

        }
        // Else (element from the right subarray is smaller or equal).
        else  {

            ary [ k ]   =   smaller [ j ++ ] ; // Take from the right subarray.
            // When an element from the right subarray is chosen before an element
            // from the left subarray, it indicates an inversion.
            // The number of remaining elements in the left subarray (mid - i)
            // are all greater than the chosen right element.
            cnt   +=   mid  -  i  ;

        }
    }
    return  cnt  ; // Return the total inversion count for this merge operation.
}