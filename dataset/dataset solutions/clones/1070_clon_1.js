/*
 *   This JavaScript file demonstrates a partitioning algorithm
 *   (specifically, the Lomuto partition scheme often used in QuickSort).
 *   It reads an array of numbers from standard input,
 *   partitions it around a chosen pivot element (the last element),
 *   and then prints the modified array with the pivot element highlighted.
 */


//  Definition of the partition function.
//  This function rearranges the elements in a given subarray
//  such that all elements less than or equal to the pivot
//  come before the pivot, and all elements greater than the pivot
//  come after it.

function   partition   (   A   ,   p   ,   r   )
{
    //  The pivot element is chosen as the last element of the subarray.
    //  In the Lomuto partition scheme, the pivot is typically A[r].
    var   x   =   A   [   r   ]   ;

    //  'i' is the index of the last element found to be
    //  less than or equal to the pivot.
    //  It marks the boundary between the "smaller than pivot" section
    //  and the "greater than pivot" section.
    var   i   =   p   -   1   ;


    //  Iterate through the subarray from the beginning 'p'
    //  up to (but not including) the pivot element at 'r'.
    for   (   var   j   =   p   ;   j   <   r   ;   j   ++   )
    {
        //  If the current element A[j] is less than or equal to the pivot 'x'...
        if   (   A   [   j   ]   <=   x   )
        {
            //  ...then increment 'i' (to expand the "smaller than pivot" section).
            i   ++   ;

            //  And swap A[i] with A[j].
            //  This moves A[j] (which is <= pivot) into its correct place
            //  within the "smaller than pivot" section.
            var   tmp   =   A   [   i   ]   ;
            A   [   i   ]   =   A   [   j   ]   ;
            A   [   j   ]   =   tmp   ;
        }
    }

    //  After the loop, all elements less than or equal to the pivot 'x'
    //  are in positions A[p...i].
    //  Now, place the pivot element (originally at A[r])
    //  into its final sorted position, which is A[i + 1].
    var   tmp   =   A   [   i   +   1   ]   ;
    A   [   i   +   1   ]   =   A   [   r   ]   ;
    A   [   r   ]   =   tmp   ;


    //  Return the final index of the pivot element.
    //  This index (i + 1) is the partitioning point.
    return   i   +   1   ;
}


//  -------------------------------------------------------------------------
//  Main script execution block:
//  Handles input reading, array parsing, partitioning, and output formatting.
//  -------------------------------------------------------------------------


//  Read all input from standard input as a UTF-8 string.
//  The 'fs' module is used for file system operations, including reading '/dev/stdin'.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

//  Split the entire input string into an array of individual lines.
var   lines   =   input   .   split   (   '\n'   )   ;


//  The first line of input usually contains the number of elements 'n'.
//  We use 'shift()' to remove it from the 'lines' array and parse it as a number.
//  The unary plus operator '+' converts the string to a number.
var   n   =   +   lines   .   shift   (   )   ;

//  The second line contains the space-separated array elements.
//  We 'shift()' this line, 'split' it by spaces, and then 'map' each string
//  element to a number using the unary plus operator.
var   A   =   lines   .   shift   (   )   .   split   (   ' '   )   .   map   (   function   (   i   )   {   return   +   i   ;   }   )   ;


//  Call the 'partition' function to rearrange the array 'A'.
//  The partition is performed on the entire array, from index 0 to A.length - 1.
//  The returned 'idx' is the final position of the pivot element.
var   idx   =   partition   (   A   ,   0   ,   A   .   length   -   1   )   ;

//  Modify the element at the pivot's final position 'idx'
//  by enclosing it in square brackets, as per problem requirements.
A   [   idx   ]   =   '['   +   A   [   idx   ]   +   ']'   ;

//  Join the elements of the modified array 'A' back into a single string,
//  with elements separated by spaces, and print it to the console.
console   .   log   (   A   .   join   (   ' '   )   )   ;