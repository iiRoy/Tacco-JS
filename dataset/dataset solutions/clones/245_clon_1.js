/*
 * This JavaScript file processes numerical data from standard input.
 * It performs a specific type of reduction operation on arrays of numbers.
 * The primary goal is to demonstrate a Type I code clone, meaning
 * only whitespace and comments are altered from the original.
 */

//  First, we load the 'fs' (file system) module
//  to enable reading from files or standard input.
let input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf-8' ); // Read the entire content of standard input as a UTF-8 string.

//  The raw input string is then processed:
//  1. Trimmed to remove any leading/trailing whitespace.
//  2. Split by newline characters to get an array of lines.
//  3. Each line (string) is further split into individual characters.
//  4. Each character (string) is converted into a number.
//  This results in an array where each element is an array of numbers.
let numsArr = ( input . trim () ) . split ( '\n' ) . map ( str  =>  str . split ( "" ) . map ( n  =>  Number ( n ) ) ) ;


//  This function takes an array of numbers and computes a new array.
//  Each element in the new array is the sum of two adjacent elements
//  from the input array, with the result taken modulo 10.
function newArr ( arr )
{
    let newArr = [ ] ; // Initialize an empty array to store the results of the sum operation.

    // Iterate through the input array, stopping one element before the end,
    // as we need to access 'i+1'.
    for ( let  i  =  0 ;  i  <  arr . length  - 1 ;  i ++ )
    {
        // Calculate the sum of the current element and the next element.
        newArr . push ( arr [ i ]  +  arr [ i + 1 ] ) ;
    }

    // After summing, map each number in the new array to its value modulo 10.
    return newArr . map ( n  =>  n  %  10 ) ;
}


//  The 'singleDown' function recursively reduces an array of numbers
//  until it contains only a single element.
//  This reduction is done by repeatedly applying the 'newArr' transformation.
function singleDown ( arr )
{
    // Base case: If the array has only one element, that's our final reduced value.
    if  ( arr . length  ===  1 )
    {
        return arr [ 0 ] ;
    }
    // Recursive step: If the array has more than one element,
    // apply the 'newArr' function to transform it,
    // and then call 'singleDown' again on the newly generated array.
    else
    {
        return singleDown ( newArr ( arr ) ) ;
    }
}


//  Finally, we process each array within 'numsArr'.
//  For each inner array ('nums'), we apply the 'singleDown' function
//  to reduce it to a single number.
//  The results are collected into a new array named 'awrs'.
let awrs = numsArr . map ( nums  =>  singleDown ( nums ) ) ;

//  The final array of reduced numbers is then printed to the console.
console . log ( awrs ) ;