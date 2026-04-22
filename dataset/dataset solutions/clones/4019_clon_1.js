process . stdin . setEncoding ( 'utf8' ) ; // Configure standard input encoding to UTF-8

// This is the main application logic, wrapped in a generator function.
// The 'yield' keyword will pause execution and wait for input from the 'run' function.
run ( function * ( ) {
    var num = yield ; // Expects an array or string from the input processing logic.
    // Example: if input is "123", num might be ['1', '2', '3'] or '123' based on how 'run' processes it.

    var first = num [ 0 ] ; // Get the first element (e.g., the first digit as a string).
    var rests = num . length - 1 ; // Calculate the count of remaining elements.

    // Perform a specific calculation and log the result to standard output.
    // This calculation assumes 'first' can be converted to a number.
    console . log ( rests * 9 + ( first - 1 ) ) ;
} ) ; // End of the main generator function passed to 'run'.

/*
 * This 'run' function is a utility to manage standard input for a generator function.
 * It allows the generator to 'yield' to request more input, effectively pausing
 * its execution until input is available.
 *
 * @param { GeneratorFunction } main The generator function that contains the primary application logic.
 */
function run ( main ) {

    var gen_main = main ( ) ; // Initialize the generator, creating a generator object.

    var cin = null ; // This variable appears to be unused in the current implementation.

    var words = [ null ] ; // A buffer to store incoming words from standard input.
                           // Initialized with 'null' as a placeholder or sentinel.

    process . stdin . pause ( ) ; // Initially pause standard input to control data flow.

    /*
     * This function is called whenever new data (a 'chunk') is received from standard input.
     * It processes the chunk, splits it into words, and then attempts to feed these words
     * to the main generator function.
     *
     * @param { string } chunk The raw data chunk received from stdin.
     */
    function get_chunk ( chunk ) {
        // Pause stdin again to ensure no more data comes in while we're processing this chunk.
        // This helps manage the flow and prevents overwhelming the buffer.
        process . stdin . pause ( ) ;

        // Split the received chunk into individual 'words' using one or more whitespace characters as delimiters.
        var nexts = chunk . split ( /\\s+/ ) ;

        // Iterate through the split words.
        for ( var i = 0 , n = nexts . length ; i < n ; ++ i ) {
            // Only add non-empty strings to the 'words' buffer.
            // This filters out empty strings that might result from splitting.
            if ( nexts [ i ] ) {
                words . push ( nexts [ i ] ) ;
            }
        }

        loop ( ) ; // After processing the new chunk, try to feed words to the generator.
    }

    /*
     * The 'loop' function is responsible for continuously feeding buffered words
     * to the generator function ('gen_main') until the buffer is empty or
     * the generator completes its execution.
     */
    function loop ( ) {
        // Continue as long as there are words in the buffer to process.
        while ( 0 < words . length ) {
            // Advance the generator with the next word from the buffer.
            // 'words.shift()' removes the first element from the array and returns it.
            var result = gen_main . next ( words . shift ( ) ) ;

            // Check if the generator yielded a value (i.e., 'result.value' is not undefined).
            // If it did, it means the generator wants to output something.
            if ( undefined !== result . value ) {
                // Use 'cork' and 'uncork' for efficient standard output by buffering writes.
                process . stdout . cork ( ) ;
                process . stdout . write ( result . value ) ; // Write the yielded value to stdout.
                process . stdout . uncork ( ) ;
            }

            // Check if the generator has finished its execution (i.e., 'result.done' is true).
            // If it has, then we can exit the 'run' function, as there's nothing more to do.
            if ( result . done ) return ;
        }

        // If the 'words' buffer becomes empty, resume standard input
        // to receive more data.
        process . stdin . resume ( ) ;
    } ; // Note: Semicolon after function declaration is syntactically allowed but often omitted.

    // Register an event listener for the 'data' event on standard input.
    // When data is received, the 'get_chunk' function will be called.
    process . stdin . on ( 'data' , get_chunk ) ;

    loop ( ) ; // Start the input processing loop immediately.
              // This will try to feed any initial words (if 'words' wasn't empty)
              // or resume stdin if the buffer is empty.
} // End of the 'run' function.