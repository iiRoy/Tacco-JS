/* This is a Type I clone of the original script.
 * The purpose of this function is to process a series of
 * commands (lines) that simulate stack operations.
 * Commands supported are 'quit', 'push <value>', and 'pop'.
 */
function main( lines )
{
    // Initialize an empty array to serve as our stack data structure.
    var  stack = [ ] ;

    /*
     * The main processing loop. It iterates through the input lines
     * indefinitely until a 'quit' command is encountered.
     */
    for ( var i = 0 ; ; i ++ )
    {
        // Get the current operation string from the input array.
        var operation = lines[ i ] ;


        // Check if the current operation is the 'quit' command.
        if ( operation . match( /^quit/ ) )
        {
            // If it's 'quit', exit the loop and terminate processing.
            break ;
        }
        else if ( operation . match( /^push/ ) ) /* Handle 'push' operations. */
        {
            // Extract the block value to be pushed onto the stack.
            // It's expected to be the second part after splitting by whitespace.
            var block = operation . split( /\s+/ ) [ 1 ] ;

            // Add the extracted block to the top of the stack.
            stack . push( block ) ;
        }
        else if ( operation . match( /^pop/ ) ) /* Handle 'pop' operations. */
        {
            // Remove and retrieve the top element from the stack.
            var block = stack . pop( ) ;

            // Output the popped element to the console.
            console . log( block ) ;
        }
    } // End of the main operation loop.
}


/*
 * This section handles standard input (stdin) to read data.
 * It accumulates chunks of data and then processes them
 * once the entire input stream has ended.
 */
var chunks = [ ] ;

// Set up an event listener for incoming data chunks from stdin.
process . stdin . on( 'data' , function( chunk )
{
    // Append each received data chunk to the 'chunks' array.
    chunks . push( chunk ) ;
} ) ; // End of 'data' event handler.


// Set up an event listener for when the stdin stream ends.
process . stdin . on( 'end' , function( )
{
    // Join all collected chunks into a single string, then split by newline
    // to get an array of individual lines.
    var lines = chunks . join( '' ) . split( '\n' ) ;

    // Call the main processing function with the collected lines.
    main( lines ) ;
} ) ; // End of 'end' event handler.