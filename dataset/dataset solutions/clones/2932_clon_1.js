// This file contains a JavaScript program to calculate a sequence of numbers.
// The 'use strict' directive enables strict mode, which helps write cleaner code.
'use strict'


// The main function processes the input and performs the calculation.
function main( input )
{
    // Trim whitespace, then split the input string by spaces into an array.
    input = input.trim() .split( ' ' ) ;

    // Parse the first element of the input array as the rate 'r'.
    const r = Number( input[ 0 ] ) ;

    // Parse the second element of the input array as the decrement 'D'.
    const D = Number( input[ 1 ] ) ;

    // Initialize an array 'ans' with the third element of the input as its first value.
    let ans = [ Number( input[ 2 ] ) ] ; // The initial value for the sequence.


    // Loop to calculate the subsequent values in the sequence.
    // The loop runs 10 times, from i = 1 to i = 10.
    for ( let i = 1 ; i <= 10 ; i ++ )
    {
        // Calculate the current element of 'ans' based on the previous element, 'r', and 'D'.
        ans[ i ] = r * ans[ i - 1 ] - D ;
    }


    // Remove the first element from the 'ans' array.
    // This typically removes the initial value that was passed in.
    ans.shift() ;

    // Print the remaining elements of the 'ans' array, joined by newline characters.
    console.log( ans.join( '\n' ) ) ;
}


// Read input from standard input and pass it to the main function.
// This is a common way to handle input in competitive programming environments.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;
// End of program.