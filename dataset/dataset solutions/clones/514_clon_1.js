/*
 * This JavaScript file reads data from standard input,
 * processes it through a series of calculations, and
 * outputs results based on certain conditions.
 *
 * It demonstrates array manipulation, sorting, and
 * iterative calculations within a loop structure.
 *
 * Version: 1.0.0
 * Author: An Expert Clone Generator
 */


// --- Start of Program Execution ---

// Require the 'fs' (file system) module to read input.
// Read the entire content of '/dev/stdin' as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Process the raw input:
// 1. Trim any leading/trailing whitespace from the input string.
// 2. Split the trimmed string into an array of strings, using newline characters as delimiters.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Begin the main processing loop. This loop continues indefinitely
// until a specific break condition is met inside.
while ( true )
{
    // Extract the first element from 'Arr', convert it to a number, and assign to 'n'.
    // The '- 0' is a common idiom for type coercion to number.
    var n = Arr . shift ( ) - 0 ;

    // Check if the value of 'n' is zero.
    // A value of 0 typically signals the end of input data for the current problem set.
    if ( n == 0 )
    {
        // If 'n' is 0, exit the main processing loop.
        break ;
    }


    // Process the next line for array 'p':
    // 1. Remove the next element from 'Arr'.
    // 2. Split it by spaces to get an array of string numbers.
    // 3. Map each string number to an actual Number type.
    var p = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Process the subsequent line for array 'j' using the same steps as for 'p'.
    var j = Arr . shift ( ) . split ( " " ) . map ( Number ) ;


    // Calculate the sum of all elements in array 'p' using the 'reduce' method.
    // The accumulator 'a' sums up 'b' (current element) in each iteration.
    var sum = p . reduce ( function ( a , b )
    {
        return a + b ;
    } ) ;


    // Sort array 'j' in descending order.
    // The comparison function 'b - a' achieves this.
    j . sort ( function ( a , b )
    {
        return b - a ;
    } ) ;


    // Initialize the 'max' variable with an initial calculated value.
    // This value is the product of 'sum' and 'n'.
    var max = sum * n ;


    // Enter a nested loop to further process array 'j' and update 'max'.
    while ( true )
    {
        // Check if array 'j' has become empty.
        if ( j . length == 0 )
        {
            // If 'j' is empty, there are no more elements to process, so break this inner loop.
            break ;
        }

        // Decrement the value of 'n' for the current iteration.
        n -- ;

        // Update 'max' by comparing its current value with a new potential maximum.
        // The new value is calculated as (sum + the next element from 'j') multiplied by the decremented 'n'.
        max = Math . max ( max , ( sum + j . shift ( ) ) * n ) ;
    }

    // After the inner loop completes, print the final calculated 'max' value to the console.
    console . log ( max ) ;
}

// --- End of Program Execution ---