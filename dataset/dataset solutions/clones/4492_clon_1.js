/*
 * This JavaScript file processes input from stdin.
 * It expects a single line of space-separated numbers as input.
 * The script then calculates three sums and outputs the minimum of these sums.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Set the encoding for standard input to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


// Register an event listener for the 'readable' event on standard input.
// This function will be called when there is data available to read.
process.stdin.on( 'readable', function ( )
{
    // Attempt to read available data from stdin.
    // 'read()' returns null if there's no data to be read.
    var       chunk = process.stdin.read();

    // Declare a variable to hold the input lines as an array.
    var   inputLineArr;

    // Proceed only if a chunk of data was successfully read.
    if ( chunk !== null )
    {
        // Split the received chunk into an array of lines based on the newline character.
        inputLineArr = chunk.split ( '\n' ) ;

        // Check if the last element of the array is an empty string (due to trailing newline).
        if( inputLineArr [ inputLineArr . length - 1 ] == '' )
        {
            // If it is, remove that empty string from the end of the array.
            inputLineArr . pop ( ) ;
        }

        // Parse the first line of input.
        // It's expected to contain space-separated numbers.
        var num = inputLineArr [ 0 ] . split ( ' ' ) . map ( function ( elem )
                                                                        {
                                                                            // Convert each string element to an integer.
                                                                            return parseInt ( elem ) ;
                                                                        } ) ;

        // Calculate three sums based on the numbers parsed from the input.
        var a = num [ 0 ] + num [ 1 ] ,
            b = num [ 1 ] + num [ 2 ] ,
            c = num [ 2 ] + num [ 0 ] ;

        // Output the smallest of the three calculated sums to the console.
        console . log ( Math . min ( a , b , c ) ) ;
    }
} ) ;

// End of script.
// This program demonstrates basic stdin processing and numerical operations.