"use strict"
// This is a JavaScript file designed to process specific input data.
// It reads from standard input, parses the lines, and performs a conditional calculation.

function   main  ( arg )
{
    // The 'main' function takes one argument, 'arg', which is expected to be a string.

    // First, process the input 'arg':
    // - Trim any leading/trailing whitespace.
    // - Split the string into an array of lines based on the newline character.
    var   data   =   arg .trim() .split( "\n" ) ;


    // Extract the first line of data and split it by spaces.
    var   c   =   data[0] .split( " " ) ;


    // Extract the second line of data, split it by spaces, and convert each part to a Number.
    var   c_n   =   data[1] .split( " " ) .map( Number ) ;


    // Extract the third line of data directly.
    var   x   =   data[2] ;


    // Now, apply the core logic:
    // Check if the value of 'x' is strictly equal to the first element of 'c'.
    if  ( x   ===   c[0] )
    {
        // If the condition is true, print a modified pair of numbers.
        // The first number is the first element of 'c_n' decremented by 1.
        // The second number is the second element of 'c_n' unchanged.
        console .log( String( c_n[0] - 1 )   +   " "   +   String( c_n[1] ) ) ;
    }
    else
    {
        // If the condition is false, print a different modified pair of numbers.
        // The first number is the first element of 'c_n' unchanged.
        // The second number is the second element of 'c_n' decremented by 1.
        console .log( String( c_n[0] )   +   " "   +   String( c_n[1] - 1 ) ) ;
    }

} // End of the 'main' function definition.


// This line executes the 'main' function immediately.
// It reads the content of '/dev/stdin' as a UTF-8 string using Node.js's 'fs' module
// and passes it as the 'arg' to the 'main' function.
main( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) ) ;