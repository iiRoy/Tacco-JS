/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */

// This script can be executed directly using Node.js or V8.
// The shebang line is for Unix-like systems.
// #!/usr/bin/env node $0 $@;exit

/**
 * The primary function that orchestrates the program's logic.
 * It reads input, performs calculations, and prints results.
 */
var main = function ( ) {

    // Declare a variable to hold the parsed input arguments.
    var arg ;

    // Loop until the first element of the parsed line is falsy (e.g., 0).
    for (
        ;
        // Read a line, split by space, convert to numbers, and assign to 'arg'.
        // The loop continues as long as arg[0] is not zero or undefined.
        ( arg = readline ( ) . split ( ' ' ) . map ( Number ) ) [ 0 ]
        ;
    ) {
        // Extract the two numbers from the current input line.
        var a = arg [ 0 ] , b = arg [ 1 ] ;

        // Calculate the minimum value based on a complex expression.
        // This involves creating an array, mapping values, and finding the minimum.
        print (
            Math . min . apply (
                null ,
                Array . apply (
                    null ,
                    {
                        length : 1 + ( a / 2 ^ 0 ) // Calculates length, equivalent to Math.floor(a/2) + 1
                    }
                ) . map (
                    function ( _ , i ) {
                        // For each element in the generated array, calculate
                        // the absolute difference between 'b' and the hypotenuse
                        // of 'i' and 'a-i'.
                        return Math . abs ( b - Math . hypot ( i , a - i ) ) ;
                    }
                )
            )
        ) ;

    } // End of the main processing loop.

} ; // End of the 'main' function definition.

/*
 * Section for Input/Output (IO) handling.
 * This part determines how input is read and output is printed,
 * depending on the execution environment (Node.js or V8).
 */
if ( 1 ) {
    // This block specifically handles execution within a Node.js environment.

    // A simple comment for the Node.js path.
    // node.js

    /**
     * Overrides the global 'print' function for Node.js to use console.log.
     * @param {*} x - The value to be printed.
     */
    var print = function ( x ) {
        console . log ( x ) ; // Output to standard console.
    } ;

    /**
     * Initializes a 'readline' function for Node.js.
     * This setup reads input asynchronously from stdin.
     */
    var readline = ( function ( ) {
        // T stores all complete input lines. cnt tracks the current line index.
        var T = [ ] , cnt = 0 ;

        // Get a reference to the standard input stream.
        var stdin = process . openStdin ( ) ;

        // Set the encoding for the input stream to UTF-8.
        stdin . setEncoding ( 'utf8' ) ;

        // Buffer to hold incomplete lines across 'data' events.
        var input_fragment = "" ;


        // Event listener for incoming data on stdin.
        stdin . on (
            'data' ,
            function ( input ) {
                // Combine any previous fragment with the new input.
                var ref = ( input_fragment + input ) . split ( "\n" ) ;

                // The last element might be an incomplete line; save it.
                input_fragment = ref . pop ( ) ;

                // Process each complete line.
                for ( var i = 0 ; i < ref . length ; i ++ ) {
                    if ( ref [ i ] == '' ) continue ; // Skip empty lines.
                    T . push ( ref [ i ] ) ; // Add non-empty lines to buffer.
                }
            }
        ) ; // End of 'data' event handler.

        // Event listener for the 'end' of the input stream.
        stdin . on (
            'end' ,
            function ( z ) {
                // If there's any remaining fragment, process it as the last line.
                if ( input_fragment ) {
                    var ref = ( input_fragment + "\n" ) . split ( "\n" ) ;
                    input_fragment = ref . pop ( ) ;
                    for ( var i = 0 ; i < ref . length ; i ++ ) {
                        if ( ref [ i ] == '' ) continue ;
                        T . push ( ref [ i ] ) ;
                    }
                }
                // Once all input is received, execute the main program logic.
                main ( ) ;
            }
        ) ; // End of 'end' event handler.


        // The actual 'readline' function returned by the IIFE.
        return function ( ) {
            // Check if there are more buffered lines to read.
            if ( T . length <= cnt ) {
                return null ; // No more lines, return null.
            }

            // Return the next line and increment the counter.
            return T [ cnt ++ ] ;
        } ;

    } ) ( ) ; // Immediately-invoked function expression (IIFE) for readline.

} else {
    // This 'else' block is for environments other than Node.js,
    // typically V8 (like d8 shell or similar environments
    // where 'readline' and 'print' are globally available).

    // v8 environment specific comment.

    // In V8, 'main' can be called directly as 'readline' and 'print'
    // are usually built-in or provided by the environment.
    main ( ) ;

} // End of the IO environment check.