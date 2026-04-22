/*
 * This JavaScript program reads input from standard input (/dev/stdin)
 * to solve a specific problem involving arrays and calculations.
 * It processes multiple test cases, each with a set of numbers.
 *
 * This is a Type I clone, meaning all functional elements,
 * such as variable names, function names, operators, and expressions,
 * are preserved exactly as in the original code.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to make the code appear visually different while maintaining identical logic.
 */


// Import the Node.js 'fs' (file system) module to read input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input:
// 1. Trim any leading or trailing whitespace from the entire input string.
// 2. Split the trimmed string into an array of lines, using the newline character as a delimiter.
var Arr = ( input . trim () ) . split ( "\n" ) ;


// Begin the main loop to process test cases.
// This loop runs indefinitely until a specific termination condition is met.
while ( true )
{
    // Read the first element from the 'Arr' array (which is assumed to be 'n').
    // Use 'shift()' to remove it from the array and convert it to a number using '- 0'.
    var n = Arr . shift () - 0 ;

    // Check if 'n' is 0. A value of 0 typically signals the end of the input stream or test cases.
    if ( n == 0 )
    {
        break ; // Exit the 'while(true)' loop if 'n' is 0.
    }


    // Read the next line from 'Arr', split it by spaces, and convert each part to a Number.
    // Store the resulting array of numbers in the variable 'p'.
    var p = Arr . shift () . split ( " " ) . map ( Number ) ;

    // Similarly, read the subsequent line, split by spaces, and convert to numbers.
    // Store this array in the variable 'j'.
    var j = Arr . shift () . split ( " " ) . map ( Number ) ;


    // Calculate the sum of all elements in array 'p'.
    // The 'reduce' method applies a function against an accumulator and each element
    // (from left to right) to reduce it to a single value.
    var sum = p . reduce ( function ( a , b ) {
        return a + b ; // Accumulates the sum.
    } ) ;

    // Sort the array 'j' in descending order.
    // The comparison function 'b - a' ensures that larger numbers come before smaller ones.
    j . sort ( function ( a , b ) {
        return b - a ;
    } ) ;


    // Initialize the 'max' variable with an initial calculated value.
    // This represents one possible outcome before considering elements from 'j'.
    var max = sum * n ;

    // Enter a nested loop to iterate and potentially update 'max' using elements from 'j'.
    while ( true )
    {
        // Check if the 'j' array is empty. If so, there are no more elements to process.
        if ( j . length == 0 )
        {
            break ; // Exit the inner 'while(true)' loop.
        }

        // Decrement 'n' for the current iteration of the inner loop.
        n -- ;

        // Calculate a new potential maximum value:
        // (current sum + the next element from 'j' (removed using shift())) multiplied by the decremented 'n'.
        // Update 'max' if this new value is greater than the current 'max'.
        max = Math . max ( max , ( sum + j . shift () ) * n ) ;
    }

    // After processing all relevant elements for the current test case,
    // print the final calculated maximum value to the console.
    console . log ( max ) ;
}

// End of the JavaScript program's execution.