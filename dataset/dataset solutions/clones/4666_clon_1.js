/*
 * This JavaScript file contains a function designed to process a numerical input.
 * The primary goal is to find specific properties related to the factors of the given number.
 *
 * This implementation includes extensive comments and varied whitespace to demonstrate
 * a Type I code clone, preserving all functional aspects and identifiers.
 */

function   main  (  lines  )
{
    // Convert the input 'lines' to a number.
    // The '- 0' operation is a common idiom for type coercion to number.
    const   input   =   lines   -   0   ;


    // Initialize an empty array to store the results of our calculations.
    // This array will hold the lengths of string representations of factors.
    var   output   =   [ ]   ;

    // Begin a loop to iterate through potential factors of the 'input' number.
    // The loop runs from 1 up to the square root of 'input' for efficiency.
    for   (  var   i   =   1  ;     i   *   i     <=   input  ;     i ++  )
    {
        // Calculate the first factor, 'a', by dividing 'input' by 'i'.
        var   a   =   input   /   i   ;

        // Calculate the second factor, 'b', using the first factor 'a'.
        // If 'i' is an exact factor, 'b' will also be an integer.
        var   b   =   input   /   a   ;

        // Determine the maximum length between the string representations of 'a' and 'b'.
        // This length is then pushed into our 'output' array.
        output .   push  (   Math .   max  (  a .   toString  ( ) .   length  ,   b .   toString  ( ) .   length  )   )   ;
    } // End of the factor iteration loop.


    // After the loop, sort the 'output' array numerically in ascending order.
    // Then, print the first element of the sorted array to the console.
    // This effectively finds the minimum maximum length found during the factor analysis.
    console .   log  (   output .   sort  (  function  ( a , b )   {   return   a   -   b   }  )  [ 0 ]   )   ;
}


// This line invokes the 'main' function.
// It reads the content of '/dev/stdin' synchronously as a UTF-8 string
// using Node.js's 'fs' module, and passes it as the 'lines' argument.
main  (  require  ( 'fs' ) .   readFileSync  ( '/dev/stdin' ,   'utf8' )  )  ;