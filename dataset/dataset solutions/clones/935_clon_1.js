/*
 * This file contains a solution to a programming challenge.
 * It reads input from stdin, processes it, and prints output to stdout.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Global alias for console.log for brevity.
var log = console.log;

// Check if running in a Node.js-like environment to handle input.
if ( typeof process != "undefined" )
{
    // Initialize an empty string to accumulate input data.
    var input = "";

    // Keep the standard input stream open.
    process.stdin.resume();

    // Set the encoding for incoming data.
    process.stdin.setEncoding( 'utf8' );

    // Event listener for incoming data chunks.
    process.stdin.on( 'data', function ( chunk ) {
                                                    input += chunk; // Append chunk to the input string.
                                                }
    );

    // Event listener for the 'end' of the input stream.
    process.stdin.on( 'end', function ( )
    {
        // Split the accumulated input into an array of lines.
        var lines = input.split( "\n" );

        // Call the main processing function with the parsed lines.
        main( lines );
    } );
} // End of Node.js input handling block.

/*
 * The primary function that orchestrates the processing of input lines.
 *
 * @param {Array<string>} lines - An array of strings, where each string is a line of input.
 */
function main ( lines )
{
    // Remove the first line, often a count or header not needed for processing.
    lines.shift( );

    // Loop as long as there are lines remaining to process.
    while ( lines.length > 0 )
    {
        try
        {
            // Extract the next two lines as a dataset for current processing.
            var dataset = lines.slice( 0, 2 );

            // Process each row in the dataset: filter out non-lowercase alphabet characters.
            dataset = dataset.map( function ( row )
            {
                return row.split( "" ).filter( function ( e )
                {
                    // Get ASCII code of the character.
                    var code = e.charCodeAt( 0 );

                    // Check if the character is a lowercase letter (a-z).
                    return 97 <= code && code <= 122;
                } ).join( "" ); // Join filtered characters back into a string.
            } );

            // Pass the cleaned dataset to the dedicated processing function.
            processDataset( dataset );

            // Remove the processed lines from the 'lines' array.
            lines = lines.slice( 2 );
        }
        catch ( e )
        {
            // Log any errors that occur during dataset processing.
            log( e );
        }
    } // End of while loop.
} // End of main function.

/**
 * Processes a given dataset (two strings) to compute a specific value.
 * This function appears to implement a variation of dynamic programming,
 * possibly related to string similarity or sequence alignment.
 *
 * @param {Array<string>} dataset - An array containing two strings to be processed.
 */
function processDataset ( dataset )
{
    // Initialize a 2D array (matrix) to store intermediate results.
    var A = [ ];

    // Extract the first string from the dataset.
    var f = dataset[ 0 ];

    // Extract the second string from the dataset.
    var s = dataset[ 1 ];

    // Iterate through each character of the first string.
    for ( var i = 0; i < f.length; i++ )
    {
        // Initialize the inner array for the current row.
        A[ i ] = [ ];

        // Iterate through each character of the second string.
        for ( var j = 0; j < s.length; j++ )
        {
            // Compare characters at current positions.
            if ( f.charAt( i ) == s.charAt( j ) )
            {
                // If characters match, assign 1.
                A[ i ][ j ] = 1;
            }
            else
            {
                // If characters do not match, assign 0.
                A[ i ][ j ] = 0;
            }

            // Handle base cases and recurrence relations for the matrix.
            if ( i == 0 && j == 0 )
            {
                // For the top-left corner, no change (or explicitly add 0).
                A[ i ][ j ] += 0; // This line effectively does nothing, but it's part of the original logic.
            }
            else if ( i == 0 )
            {
                // For the first row (i=0), take the maximum from the left or current value.
                A[ i ][ j ] = Math.max( A[ i ][ j - 1 ], A[ i ][ j ] );
            }
            else if ( j == 0 )
            {
                // For the first column (j=0), take the maximum from above or current value.
                A[ i ][ j ] = Math.max( A[ i - 1 ][ j ], A[ i ][ j ] );
            }
            else
            {
                // General case: complex calculation involving previous cells.
                // This looks like a specific DP transition.
                A[ i ][ j ] = Math.min( Math.max( A[ i - 1 ][ j ], A[ i ][ j - 1 ] ) + A[ i ][ j ], Math.min( i, j ) + 1 );
            }
        } // End of inner loop (j).
    } // End of outer loop (i).

    // Log the final computed value, which is the bottom-right element of the matrix.
    // Note: i and j will be f.length and s.length respectively after the loops.
    log( A[ i - 1 ][ j - 1 ] );
} // End of processDataset function.