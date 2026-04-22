/* This script is designed to process input data from stdin. */

process
    .stdin
    .resume(); // Ensures the standard input stream remains open and active for input.


// Set the character encoding for the standard input stream to UTF-8.
// This is crucial for handling various character sets correctly.
process.stdin.setEncoding( "utf8" );


// Attach an event listener to the 'data' event of the standard input stream.
// This function will be executed whenever new data chunks are available.
process.stdin.on( "data",
    function ( chunk )
    {
        // Split the incoming data chunk into an array of strings,
        // using the newline character as a delimiter.
        var data = chunk.split( "\n" );

        // Implement a specific condition: if the number of lines in the data
        // exceeds two, the program intentionally enters an infinite loop.
        // This acts as an early exit or error condition handler.
        if ( data.length > 2 )
            while ( 1 ); // This loop will run indefinitely.

        // Define a regular expression to capture two sequences of digits,
        // separated by a single space character.
        var reg = /([\d]+) ([\d]+)/;


        // Iterate through each individual line of the processed data array.
        for ( var i = 0; i < data.length; i ++ )
        {
            // Attempt to execute the regular expression against the current line.
            // The `exec` method returns an array of matches or null if no match is found.
            var result = reg.exec( data[ i ] );

            // Check if a match was successfully found and if the match array
            // contains the expected number of captured groups (the two numbers plus the full match).
            if ( result && result.length === 3 )
            {
                // The following lines were previously active code for writing to stdout,
                // but have since been commented out. They are retained for historical context.
                // Former functionality: process.stdout.write((parseInt(result[1]) + parseInt(result[2])).toString());
                // Follow-up: process.stdout.write("\n");

                // Parse the first and second captured groups (which are strings) into integers,
                // sum them, and then output the final sum to the console.
                console.log( parseInt( result[ 1 ] ) + parseInt( result[ 2 ] ) );
            }
        }
    }
); // End of the 'data' event handler function definition.


// Attach an event listener to the 'end' event of the standard output stream.
// This callback function is currently empty, meaning no specific action is taken
// when the stdout stream finishes. It might serve as a placeholder.
process.stdout.on( "end", function () { /* No operations are performed here. */ } );