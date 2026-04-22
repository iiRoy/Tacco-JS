/*
 * This script processes an array of numbers to calculate a specific sum.
 * It reads input from standard input, parses it, and then performs
 * calculations based on array indices and values.
 */

'use strict' ; // Enforce strict mode for cleaner code and fewer errors.

// Import the 'fs' module for file system operations.
const   lines   =   require ( 'fs' )
                      . readFileSync ( '/dev/stdin' ,   'utf8' )
                        . trim ( )
                          . split ( '\n' ) ;

// The first line of input contains the total number of elements, N.
const   N   =   +lines [ 0 ] ;

// The second line contains the space-separated array elements.
const   A   =   lines [ 1 ] . split ( ' ' ) ;

/*
 * Create an 'indices' array to store the original position of each number.
 * For example, if A = [3, 1, 2], then indices will be:
 * indices[0] = 1 (because 1 is at A[1])
 * indices[1] = 2 (because 2 is at A[2])
 * indices[2] = 0 (because 3 is at A[0])
 * This array helps in quickly finding the position of a specific value.
 */
let   indices   =   [ ] ;

for   (   let   i   =   0 ;   i   <   N ;   i ++   )
{
    // The value A[i] needs to be converted to a number, then decremented by 1
    // to use it as a 0-based index.
    indices [   +A [ i ]   -   1   ]   =   i ;
}


// Initialize 'sum' which will accumulate the final result.
let   sum   =   0 ,

// 'que' is a queue (implemented as an array) that stores sub-problems.
// Each sub-problem is represented by [left_bound, right_bound, current_index_in_indices].
// The initial problem covers the entire array from index 0 to N-1,
// starting with the smallest value's index in the 'indices' array (which is 0).
    que   =   [   [   0 ,   N   -   1 ,   0   ]   ] ;


// Process the queue until it becomes empty.
while   (   que . length   >   0   )
{
    // Dequeue the next sub-problem: [left, right, i].
    let   lri   =   que . shift ( ) ,
        left   =   lri [ 0 ] ,
        right   =   lri [ 1 ] ,
        i   =   lri [ 2 ] ;

    // Base case: If the sub-problem range contains only one element.
    if   (   left   ===   right   )
    {
        // Add the value of that single element to the total sum.
        sum   +=   +A [ left ] ;
        continue ; // Move to the next iteration of the while loop.
    }

    /*
     * Find the smallest available number (based on 'i' from 'indices')
     * that falls within the current [left, right] range.
     * Increment 'i' until indices[i] is within the valid range.
     * 'indices[i]' gives the original array position of the number (i+1).
     */
    while   (   indices [ i ]   <   left   ||   indices [ i ]   >   right   )
    {
        i ++ ;
    }

    // 'ind' is the original array index of the smallest number in the current range.
    let   ind   =   indices [ i ] ;

    /*
     * Calculate the contribution of the element at 'ind' to the sum.
     * The value is A[ind].
     * It contributes to (ind - left + 1) * (right - ind + 1) subarrays.
     * This is a standard formula for range-based calculations.
     */
    sum   +=   +A [ ind ]   *   (   ind   -   left   +   1   )   *   (   right   -   ind   +   1   ) ;

    // If there's a sub-range to the left of 'ind', enqueue it.
    // The next smallest number to consider in this sub-range would be i + 1.
    if   (   left   <=   ind   -   1   )
    {
        que [   que . length   ]   =   [   left ,   ind   -   1 ,   i   +   1   ] ;
    }

    // If there's a sub-range to the right of 'ind', enqueue it.
    // The next smallest number to consider in this sub-range would also be i + 1.
    if   (   ind   +   1   <=   right   )
    {
        que [   que . length   ]   =   [   ind   +   1 ,   right ,   i   +   1   ] ;
    }
}

// Output the final calculated sum.
console . log (   sum   ) ;