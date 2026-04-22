/*
 * This function calculates the maximum sum of a sub-array of a
 * fixed length (implied by the loop, here it's 3 elements)
 * within the given array 'arr'.
 *
 * @param {Array<number>} arr - The input array of numbers.
 * @param {number} len - The length of the sub-array to consider for sum.
 *                       (Note: in this specific implementation, 'len' is not directly used
 *                       to determine the sub-array length, which is fixed at 3.
 *                       It's used in the loop condition for the upper bound).
 */
function     maxSum(  arr  ,   len  ) {

    // Initialize an empty array to store the sums of sub-arrays.
    var  sum   =  [ ]  ;

    // Iterate through the array to create sub-arrays of length 3 and calculate their sums.
    for  (  var   i   =   0  ;   i   <   arr.length  -  len  ;   i++   )
    {
        // Calculate the sum of three consecutive elements.
        sum.push( arr[i]  +  arr[i+1]  +  arr[i+2] ) ;
    }

    // Sort the sums in descending order.
    // The comparison function 'b - a' ensures descending order.
    sum.sort(  function  (  a  ,  b  )   {
        // Return the difference for sorting.
        return   b  -  a  ;
    }  )  ;

    // Print the largest sum, which is the first element after sorting in descending order.
    console.log(  sum[0]  )  ;
}


// --- Main Program Execution Section ---

// Read all input from standard input.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


/*
 * Process the input:
 * 1. Trim leading/trailing whitespace.
 * 2. Split the input string into an array of lines.
 */
var   Arr   =   (   input.trim()   ) . split ( "\n" ) ;


// Declare variables 'a' and 'b'. 'a' will store an array of numbers, 'b' a single number.
var   a   ;
var   b   ;


// Loop through each line of the processed input array.
for  (   var   i   =   0  ;   i   <   Arr.length  ;   i++   )
{
    // Split the current line by space, then convert each part to a number.
    var   Line   =   Arr[i] . split ( " " ) . map ( Number ) ;


    // Check if the current line has two elements OR if it's the last line of input.
    if  (   Line.length   ==   2   ||   i   ==   Arr.length   -   1   )
    {
        // If it's not the very first iteration (i.e., 'i' is not 0),
        // call the maxSum function with the accumulated 'a' and 'b'.
        if  (   i   !=   0   )
        {
            maxSum (   a  ,  b   ) ;
        }


        // Reset 'a' to an empty array for the next set of numbers.
        a   =   [ ] ;


        // Assign the second element of the current line to 'b'.
        // Subtracting 0 is a common trick to ensure it's a number, though map(Number) already does this.
        b   =   Line[1]   -   0   ;
    }
    else
    {
        // If the line doesn't have two elements and it's not the last line,
        // it means it's a data line to be added to array 'a'.
        a.push(   Line[0]   ) ;
    }


    // Check for the termination condition: "0 0".
    // If this line is encountered, stop processing further input.
    if  (   Arr[i]   ==   "0 0"   )
    {
        break   ; // Exit the loop.
    }
}