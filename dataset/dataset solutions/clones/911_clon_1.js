/* #!/usr/bin/env node $0 $@;exit */

/*
 * This is the main program entry point.
 * It reads input lines and processes them.
 */
var main = function ( )
{
    var arg ; // Declare variable to hold parsed arguments.

    // Loop until an empty line or a line starting with 0 is encountered.
    for ( ; ( arg = readline ( ) . split ( ' ' ) . map ( Number ) ) [ 0 ] ; )
    {
        // Extract 'a' and 'b' from the first two elements of the parsed array.
        // Initialize 'r' with a large value (1 shifted left by 30 bits).
        var a = arg [ 0 ] , b = arg [ 1 ] , r = 1 << 30 ;

        /*
         * Iterate from i = 0 up to a/2 (integer division).
         * Calculate the hypotenuse of i and (a-i).
         * Find the minimum absolute difference between 'b' and this hypotenuse.
         */
        for ( var i = 0 ; i <= a / 2 ^ 0 ; i ++ )
        {
            r = Math . min ( r , Math . abs ( b - Math . hypot ( i , a - i ) ) ) ;
        }

        // Print the calculated minimum value 'r'.
        print ( r ) ;
    }
} ;

/*
 * --- Input/Output Handling ---
 * This section manages how the script interacts with stdin/stdout,
 * adapting for Node.js or V8/SpiderMonkey environments.
 */
if ( typeof process !== 'undefined' )
{
    // Execution environment is Node.js.
    // Define a 'print' function that uses console.log.
    var print = function ( x )
    {
        console . log ( x ) ; // Output the value to the console.
    } ;

    // Define a 'readline' function for Node.js to read input line by line.
    var readline = ( function ( )
    {
        var T = [ ] , cnt = 0 ; // T stores lines, cnt is current line index.

        var stdin = process . openStdin ( ) ; // Open standard input stream.
        stdin . setEncoding ( 'utf8' ) ; // Set encoding to UTF-8.


        var input_fragment = "" ; // Buffer for incomplete lines.

        // Event listener for incoming data chunks.
        stdin . on ( 'data' , function ( input )
        {
            var ref = ( input_fragment + input ) . split ( "\n" ) ; // Combine fragment and new input, then split by newline.
            input_fragment = ref . pop ( ) ; // The last element is a fragment if input doesn't end with newline.

            // Process complete lines.
            for ( var i = 0 ; i < ref . length ; i ++ )
            {
                if ( ref [ i ] == '' ) continue ; // Skip empty lines.
                T . push ( ref [ i ] ) ; // Add line to the buffer.
            }
        } ) ;

        // Event listener for end of input.
        stdin . on ( 'end' , function ( z )
        {
            // Process any remaining input fragment as a final line.
            if ( input_fragment )
            {
                var ref = ( input_fragment + "\n" ) . split ( "\n" ) ;
                input_fragment = ref . pop ( ) ;

                for ( var i = 0 ; i < ref . length ; i ++ )
                {
                    if ( ref [ i ] == '' ) continue ;
                    T . push ( ref [ i ] ) ;
                }
            }

            main ( ) ; // Call the main function after all input is buffered.
        } ) ;


        // Return the actual readline function.
        return function ( )
        {
            if ( T . length <= cnt ) return null ; // No more lines available.
            return T [ cnt ++ ] ; // Return the next buffered line and increment counter.
        } ;
    } ) ( ) ;
}
else
{
    // Execution environment is V8 (or similar, like SpiderMonkey shell).
    // In these environments, 'readline' and 'print' are typically built-in.
    main ( ) ; // Directly call the main function.
}