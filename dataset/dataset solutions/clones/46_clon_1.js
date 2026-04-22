/*
 * This JavaScript file processes input from stdin.
 * It reads a chunk of data, then calls the main function
 * to perform some array manipulation based on the input.
 *
 * Author: Clone Generator
 * Date: 2023-10-27
 */

// Resume stdin to ensure the process doesn't exit prematurely.
process.stdin.resume( );

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding(   'utf8'   );

// Attach a 'data' event listener to process incoming data.
process.stdin.on( 'data' ,
    function( chunk   )
    {
        // Call the main function, trimming any leading/trailing whitespace from the chunk.
        main(  chunk.trim() );
    }
);


/**
 * The main function processes the input chunk.
 * It interprets the first two lines as numbers 'w' and 'n',
 * initializes an array 'ans', performs 'n' swaps,
 * and then prints the elements of 'ans'.
 * @param {string} chunk - The input data as a string.
 */
function main( chunk )
{
    // Split the input chunk into an array of lines.
    var lines = chunk.split( "\n" );

    // Parse the first line as the width 'w'.
    var w = Number( lines[0] );

    // Parse the second line as the number of operations 'n'.
    var n = Number( lines[1] );

    // Initialize an empty array to store the answer sequence.
    var ans = [ ];

    // Populate the 'ans' array with numbers from 1 to 'w'.
    for ( var i = 1 ; i <= w ; i++ )
    {
        ans.push( i ); // Add the current number to the array.
    }


    // Initialize an index to start reading operation details from the third line.
    var index = 2;

    // Loop 'n' times to perform the specified swap operations.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Extract the line containing swap details.
        var currentLine = lines[index];

        // Split the current line by comma and parse the first part as 'a'.
        // Subtract 1 to convert to 0-based indexing.
        var a = Number( currentLine.split( "," )[0] ) - 1;

        // Split the current line by comma and parse the second part as 'b'.
        // Subtract 1 to convert to 0-based indexing.
        var b = Number( currentLine.split( "," )[1] ) - 1;

        // Perform the swap operation using a temporary variable.
        var tmp = ans[a];
        ans[a] = ans[b];
        ans[b] = tmp;

        // Move to the next line for the next operation.
        index++;
    }


    // After all swaps, print each element of the 'ans' array on a new line.
    for ( var i = 0 ; i < w ; i++ )
    {
        console.log( ans[i] );
    }
}