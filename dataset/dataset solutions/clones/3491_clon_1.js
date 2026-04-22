/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript syntax and best practices.
 */
'use strict';

// This function serves as the main entry point for processing the input.
function Main ( INPUT )
{
    // Split the entire input string by newline characters to get an array of lines.
    const input = INPUT.split( "\n" ) ;

    /*
     * The target value T is extracted from the second element of the first line.
     * The first line is split by space, and the second part is converted to a number.
     */
    const T = Number( input[ 0 ] . split( " " )[ 1 ] ) ;

    // Remove the first line of the input array as it has been processed for T.
    input.shift();

    // Initialize 'min' with a large sentinel value to find the true minimum later.
    let min = 9999 ;


    // Iterate through the remaining lines of the input array.
    for ( let i = 0 ; i < input.length ; i++ )
    {
        /*
         * Each line is split by space, and its elements are mapped to numbers.
         * The result is stored in a temporary array 'tmp'.
         */
        let tmp = input[ i ].split( " " ) . map( n => Number( n ) ) ;

        // Check two conditions:
        // 1. The second element of 'tmp' (tmp[1]) must be less than or equal to T.
        // 2. The first element of 'tmp' (tmp[0]) must be less than the current 'min' value.
        if ( tmp[ 1 ] <= T && tmp[ 0 ] < min )
        {
            // If both conditions are met, update 'min' with the new smaller value.
            min = tmp[ 0 ] ;
        }
    }


    // After processing all lines, print the result to the console.
    // If 'min' is still the initial sentinel value (9999), it means no valid item was found,
    // so print "TLE". Otherwise, print the found minimum value.
    console.log( min == 9999 ? "TLE" : min ) ;
}

/*
 * This line reads the input from standard input (/dev/stdin)
 * using Node.js's file system module and passes it to the Main function.
 * The input is read as UTF-8 encoded text.
 */
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;