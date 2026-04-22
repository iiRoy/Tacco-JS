// This script is designed to process standard input.
process.stdin.resume( );

// Set the encoding for incoming data.
process.stdin.setEncoding ('ascii' );


var input_stdin = "";  // Accumulates all input data.
var input_stdin_array = ""; // Stores input split into lines.
var input_currentline = 0; // Keeps track of the current line being read.


// Event listener for incoming data.
process.stdin.on ( 'data' , function ( data )
{
    input_stdin += data; // Append new data to the buffer.
}
)
; /* This section is commented out. It was potentially used for handling SIGINT signals,
     but is currently disabled. It would have processed input and called main() on interruption.
   */
// The 'end' event signals that all input has been received.
process.stdin.on( 'end', function ( ) {
    input_stdin_array = input_stdin.split("\n"); // Split the accumulated input by newlines.
    main ( ) ; // Execute the primary logic of the program.
} );


// Helper function to read a line from the processed input array.
function readLine ( )
{
    return input_stdin_array [ input_currentline++ ] ; // Return the current line and advance the pointer.
}

// /////////////// Everything above this line is boilerplate for input handling ////////////////////


// The main function where the core logic of the program resides.
function main ( )
{
    // Read the first line which contains N and M.
    var s = readLine ( ) ;
    s = s.split ( " " ); // Split the line by space to get N and M.
    var N = parseInt ( s [ 0 ] ) ; // Parse N as an integer.
    var M = parseInt ( s [ 1 ] ) ; // Parse M as an integer.
    var A = [ ] ; // Initialize array A.
    var B = [ ] ; // Initialize array B.


    // Populate array A based on N.
    for ( var i = 0 ; i < N ; i++ )
    {
        s = readLine ( ) . substr ( 0 , N ) ; // Read a line and take the first N characters.
        A.push ( s ) ; // Add the processed string to array A.
    }

    // Populate array B based on M.
    for ( var i = 0 ; i < M ; i++ )
    {
        s = readLine ( ) . substr ( 0 , M ) ; // Read a line and take the first M characters.
        B.push ( s ) ; // Add the processed string to array B.
    }

    var ans = "No" ; // Default answer is "No".

    // Nested loops to search for B within A.
    for ( var i = 0 ; i < N - M + 1 ; i++ )
    {
        for ( var j = 0 ; j < N - M + 1 ; j++ )
        {
            var iguales = 1 ; // Flag to check if a match is found (1 for true, 0 for false).
            // Inner loop to compare sub-grids.
            for ( var k = 0 ; k < M ; k++ )
            {
                // Compare a substring of A with an element of B.
                if ( A [ i + k ] . substr ( j , M ) . localeCompare ( B [ k ] ) != 0 )
                {
                    iguales = 0 ; // Mismatch found.
                    break ; // Exit the innermost loop.
                }
            }
            // If all elements matched in the inner loop.
            if ( iguales == 1 )
            {
                process.stdout.write ( "Yes" ) ; // Output "Yes".
                process.exit ( ) ; // Terminate the process.
            }
        }
    }

    // If no match was found after all comparisons.
    process.stdout.write ( "No" ) ; // Output the default "No".
    process.exit ( ) ; // Terminate the process.
}