/*
 * This JavaScript snippet is designed to process streaming input.
 * It reads lines from standard input, expecting each line to contain
 * two space-separated integers. For every such valid line,
 * it computes the sum of these two integers and prints the result
 * to standard output, followed by a newline character.
 * This script demonstrates basic I/O operations in Node.js.
 */

// Resume the standard input stream to begin listening for data.
// This is necessary to prevent the program from exiting immediately.
process.stdin.resume();

// Set the character encoding for the standard input stream.
// UTF-8 is a common and robust encoding for text data.
process.stdin.setEncoding( "utf8" );


// Attach an event listener to the standard input stream.
// This function will be called whenever new data chunks are available.
process.stdin.on(
    "data",
    function ( chunk )
    {
        // Split the incoming data 'chunk' into individual lines.
        // The split method uses the newline character as a delimiter.
        var data = chunk.split( "\n" );

        // Define a regular expression to match two numbers separated by a space.
        // '([\d]+)' captures one or more digits as a group.
        // The 'g' flag is not needed here as we process line by line.
        var reg = / ( [\d] + )    ( [\d] + ) / ;

        // Iterate over each line obtained from the input chunk.
        // The loop continues as long as 'i' is less than the total number of lines.
        for ( var i = 0 ; i < data.length ; i ++ )
        {
            // Attempt to execute the regular expression against the current line.
            // If a match is found, 'result' will be an array; otherwise, it will be null.
            var result = reg.exec( data[ i ] ) ;

            // Check if a match was successful and if it captured both groups of numbers.
            // 'result.length === 3' means the full match and two captured groups are present.
            if ( result  &&  result.length === 3 )
            {
                // Parse the first captured number (at index 1) and the second (at index 2) into integers.
                // Sum them up, then convert the sum back to a string, and write it to standard output.
                process.stdout.write( ( parseInt( result[ 1 ] )  +  parseInt( result[ 2 ] ) ) . toString ( ) ) ;

                // After writing the sum, write a newline character to standard output.
                // This ensures each sum appears on its own line.
                process.stdout.write( "\n" ) ;
            }
        }
    }
) ;