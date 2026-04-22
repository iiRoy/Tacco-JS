/*
 * This file contains an implementation of the Merge Sort algorithm
 * along with a main function to read input, sort an array,
 * and print the sorted array and the total comparison count.
 */

var  cnt = 0; // Global counter for comparisons in the merge step.

(   function main (  )
{
    // Main execution block of the program.
    // This is an Immediately Invoked Function Expression (IIFE).
    const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8'   ) . trim (  ) . split ( '\n'  ) ;

    // The first line of input specifies the number of elements.
    const n = Number ( lines . shift ( ) ) ;

    // The second line of input contains the space-separated array elements.
    let arr = lines . shift ( ) . split ( ' ' ) . map ( Number ) ;


    // Call the mergeSort function to sort the array.
    // The sort range is from index 0 up to (but not including) n.
    mergeSort ( arr ,   0 ,   n   ) ;

    // Output the sorted array elements joined by spaces.
    console . log ( arr . join ( ' ' ) ) ;

    // Output the total count of comparisons made during the merge operations.
    console . log ( cnt ) ;
} ) (   ) ; // End of IIFE.


/**
 *  Performs the merge step of the Merge Sort algorithm.
 *  It merges two sorted sub-arrays back into a single sorted array.
 *
 *  @param {Array<number>} arr   The main array being sorted.
 *  @param {number}        left  The starting index of the left sub-array.
 *  @param {number}        mid   The ending index of the left sub-array (and start of the right).
 *  @param {number}        right The ending index of the right sub-array.
 */
function merge ( arr ,   left ,   mid ,   right )
{
    // Create temporary arrays for the left and right halves.
    let L = arr . slice ( left ,   mid ) ;
    let R = arr . slice ( mid ,   right ) ;

    // Sentinel values to simplify comparison logic.
    L . push ( Infinity ) ;
    R . push ( Infinity ) ;

    let i = 0 ; // Index for the left temporary array.
    let j = 0 ; // Index for the right temporary array.

    // Merge the two temporary arrays back into the original array.
    for ( let k = left ;   k < right ;   k ++ )
    {
        if (   L [ i ]   <=   R [ j ]   )
        {
            arr [ k ]   =   L [ i ++ ] ;
        }
        else
        {
            arr [ k ]   =   R [ j ++ ] ;
        }
        cnt ++ ; // Increment comparison counter.
    }
}


/**
 *  Implements the Merge Sort algorithm recursively.
 *  Divides the array into two halves, recursively sorts them,
 *  and then merges the sorted halves.
 *
 *  @param {Array<number>} arr   The array to be sorted.
 *  @param {number}        left  The starting index of the sub-array to sort.
 *  @param {number}        right The ending index of the sub-array to sort (exclusive).
 */
function mergeSort ( arr ,   left ,   right )
{
    // Base case: if the sub-array has 0 or 1 element, it's already sorted.
    if (   left + 1   <   right   )
    {
        // Calculate the middle point to divide the array.
        let mid = Math . floor ( (   left   +   right   )   /   2   ) ;

        // Recursively sort the left half.
        mergeSort ( arr ,   left ,   mid ) ;

        // Recursively sort the right half.
        mergeSort ( arr ,   mid ,   right ) ;

        // Merge the two sorted halves.
        merge ( arr ,   left ,   mid ,   right ) ;
    }
}