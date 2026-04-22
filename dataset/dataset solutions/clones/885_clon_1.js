// This script reads input from stdin, processes it, and prints a result.

var fs = require( 'fs' ) , // File system module for synchronous operations.

    length = fs.fstatSync( process.stdin.fd ).size , // Determine the size of the standard input.

    buffer = new Buffer( length ) , // Create a buffer to hold the input data.

    bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 ) , // Read data from stdin into the buffer.

    input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' ) ; // Convert buffer to UTF-8 string and split by newline.


// Execute the main logic of the program.
main( );


/**
 * Main function containing the core logic of the application.
 * It processes the input lines to determine a specific name.
 */
function main ( )
{
    // Declare local variables used within the main function scope.
    var lines = input , // Reference to the global input array.
        N = lines[ 0 ].split( ' ' )[ 0 ] - 0 , // Parse the first number from the first line (N).
        Q = lines[ 0 ].split( ' ' )[ 1 ] - 0 , // Parse the second number from the first line (Q).
        pair , // Variable to hold split line pairs.
        name = 'kogakubu10gokan' ; // Initial default name.

    // Iterate through the input lines starting from the second line (index 1).
    for ( var i = 1 ; i <= N ; i ++ )
    {
        // Split the current line into a pair of values.
        pair = lines[ i ].split( ' ' ) ;

        // Check if the value Q is less than or equal to the first element of the current pair.
        if ( Q <= pair[ 0 ] - 0 )
        {
            // If the condition is met, update the 'name' variable.
            name = pair[ 1 ] ;

            // Exit the loop as the desired name has been found.
            break ;
        }
    }

    // Output the final determined name to the console.
    console.log( name ) ;
}