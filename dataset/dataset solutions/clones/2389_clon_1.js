/*
 * This is a JavaScript file demonstrating input processing and a simple Caesar cipher-like transformation.
 * It reads input from standard in, processes it, and then outputs to standard out.
 *
 * The code below is a Type I clone, meaning its functionality and core structure are identical to the original.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered significantly
 * to provide a visually distinct, yet functionally equivalent, version.
 */

//  Initialize standard input to resume operation.
process.stdin.resume();


// Set the encoding for standard input to UTF-8.
// This ensures proper character handling.
process.stdin.setEncoding('utf8');


/*
 * Declare an array to store all incoming lines from standard input.
 * This array will accumulate data as it arrives.
 */
var lines = [];

/*
 * Create a readline interface.
 * This interface allows reading line-by-line input from a readable stream,
 * in this case, process.stdin.
 * It also specifies the output stream, process.stdout, though it's not
 * directly used for writing *by* the readline module in this context,
 * it's a common pairing.
 */
var    reader = require('readline').createInterface(
    {
        input: process.stdin, // The input stream source
        output: process.stdout // The output stream target (for prompts, etc. - not used here)
    }
);


/*
 * Register an event listener for the 'line' event.
 * This callback function will be executed every time a new line of input
 * is received from the standard input stream.
 * The received 'line' is then pushed into the 'lines' array.
 */
reader.on('line', ( line ) =>
{

    // Push the received line into our global 'lines' array.
    lines.push( line );

});


/*
 * Register an event listener for the 'close' event.
 * This callback function runs when the input stream closes, indicating
 * that all input has been received.
 * All core processing logic resides within this block.
 */
reader.on(
    'close',
    ( ) =>
    {

        // Parse the first line of input as an integer.
        // This 'num' variable will likely represent a shift value for a cipher.
        var num = parseInt( lines[ 0 ] );

        // The second line of input is treated as the string to be processed.
        var list = lines[ 1 ];


        // Convert the input string 'list' into an array of individual characters.
        list = list.split( '' );

        /*
         * Define the alphabet for the cipher.
         * This uses uppercase English letters.
         * It's also split into an array for easy indexing.
         */
        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' );


        // Initialize an empty string to build the result of the transformation.
        var result = '';


        /*
         * Loop through each character in the 'list' (the input string).
         * This is the core transformation loop.
         */
        for ( var i = 0 ; i < list.length ; i ++ )
        {

            // Find the index of the current character from 'list' within our 'alphabet'.
            var idx = alphabet.indexOf( list[ i ] );

            // Initialize a variable for the new index after transformation.
            var new_idx = 0;

            // Check if the shifted index would exceed the bounds of the alphabet (0-25).
            // If it does, wrap around using modulo arithmetic (effectively subtracting 26).
            if ( idx + num > 25 )
            {
                // Apply the shift and wrap-around logic.
                new_idx = idx + num - 26;
            }
            else
            {
                // If no wrap-around is needed, simply apply the shift.
                new_idx = idx + num;
            }

            // Append the character at the 'new_idx' from the 'alphabet' to our 'result' string.
            result += alphabet[ new_idx ];

        }

        // Output the final transformed string to the console (standard output).
        console.log( result );
    }
);

// End of file. This comment serves no functional purpose.