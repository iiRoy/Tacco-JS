/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been modified extensively to create
 * a visually different, yet functionally identical, code fragment.
 */

// Core Node.js modules for file system operations.
var fs = require('fs')

    // Determine the size of the standard input stream.
    ,   length = fs.fstatSync( process.stdin.fd ).size

    // Create a buffer to hold the input data.
    ,   buffer = new Buffer( length )

    // Read data from standard input into the buffer.
    ,   bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 )

    // Convert buffer to UTF-8 string and split by newlines to get input array.
    ,   input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' )
;

// Start the main execution flow.
main( );


/**
 * Main function where the core logic of the program resides.
 * It processes a string from standard input and generates an output string.
 */
function main( )
{
    // Retrieve the first line of input.
    var str = input[ 0 ];

    // Initialize the answer string.
    var ans = '';

    // Loop counters and temporary variables.
    var i, len, j, diff, sqr, pmchar;

    // Variable to store the previous character code for difference calculation.
    var prev = 0;

    // A constant threshold value.
    var N = 160;

    // Array to store character codes of the input string.
    var charCodeList = [ ];


    // Populate the charCodeList with character codes from the input string.
    for ( i = 0, len = str.length;
          i < len;
          i++ )
    {
        charCodeList[ i ] = str.charCodeAt( i );
    }


    // Main loop to process each character code.
    // 'prev' is updated at the end of each iteration to hold the current charCodeList[i].
    for ( i = 0; i < len; prev = charCodeList[ i ], i++ )
    {
        // Calculate the difference between the current and previous character codes.
        diff = charCodeList[ i ] - prev;

        // If the difference is zero, append a dot and continue to the next character.
        if ( diff === 0 )
        {
            ans += '.';
            continue;
        }


        // Determine the positive or negative character based on the difference sign.
        pmchar = diff > 0 ? '+' : '-';

        // Get the absolute value of the difference.
        diff = Math.abs( diff );


        // If the absolute difference is less than N, append 'pmchar' directly.
        if ( diff < N )
        {
            // Append 'pmchar' 'diff' number of times.
            for ( j = diff; j > 0; j-- )
            {
                ans += pmchar;
            }
        }
        // If the absolute difference is N or greater, use a more complex pattern.
        else
        {
            // Calculate the integer square root of the difference.
            sqr = ~~Math.sqrt( diff );

            // Append '>' to the answer.
            ans += '>';

            // Append '+' 'sqr' number of times.
            for ( j = sqr; j > 0; j-- )
            {
                ans += '+';
            }

            // Append '[<' to the answer.
            ans += '[<';

            // Append 'pmchar' 'sqr' number of times.
            for ( j = sqr; j > 0; j-- )
            {
                ans += pmchar;
            }

            // Append '>-]<' to the answer.
            ans += '>-]<';

            // Append 'pmchar' for the remaining difference.
            for ( j = diff - sqr * sqr; j > 0; j-- )
            {
                ans += pmchar;
            }
        }

        // Always append a dot after processing the current character.
        ans += '.';
    }

    // Output the final generated string to the console.
    console.log( ans );
}