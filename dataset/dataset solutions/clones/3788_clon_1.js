/*
 * This JavaScript code snippet defines a function 'main'
 * that processes numerical input from standard input.
 * It's designed to read two integers, perform arithmetic operations,
 * and then output the maximum of the results.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

function main( input )
{
    // Step 1: Split the input string by space to get an array of string numbers.
    var a = input.split( ' ' );

    // Step 2: Convert the first string element to an integer.
    // The radix 10 is specified to ensure decimal parsing.
    a[ 0 ] = parseInt( a[ 0 ], 10 );

    // Step 3: Convert the second string element to an integer.
    a[ 1 ] = parseInt( a[ 1 ], 10 );


    // Step 4: Calculate the sum of the two parsed integers.
    var a1 = a[ 0 ] + a[ 1 ];

    // Step 5: Calculate the difference (first - second) of the two integers.
    var a2 = a[ 0 ] - a[ 1 ];

    // Step 6: Calculate the product of the two integers.
    var a3 = a[ 0 ] * a[ 1 ];


    // Step 7: Find the maximum value among the sum, difference, and product.
    var a4 = Math.max( a1, a2, a3 );

    // Step 8: Handle the specific edge case for negative zero.
    // In JavaScript, -0 is a distinct value but loosely equal to 0.
    // If the maximum value happens to be -0, convert it to positive 0.
    if ( a4 === -0 )
    {
        a4 = 0; // Reassign -0 to 0.
    }

    // Step 9: Print the final maximum value to the console.
    console.log( a4 );
}

// This block of code executes the 'main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's 'fs' module and passes it as input.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );