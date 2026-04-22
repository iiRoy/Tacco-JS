/*
 * This is a Type I clone generated from the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly to
 * provide a visually distinct representation.
 */

// Begin listening for data on the standard input stream.
process . stdin . on ( "data" ,
    // This anonymous function is the handler for incoming data chunks.
    function ( c ) {
        // The data chunk 'c' is converted to a string,
        // then leading/trailing whitespace is removed,
        // and finally, the string is split into an array of lines.
        // The 'some' method iterates over each line.
        ( c + "" ) . trim ( ) . split ( "\n" ) . some (
            // Callback function for each line 's' from the input.
            function ( s ) {
                // Split the current line by spaces to extract individual string tokens.
                s = s . split ( " " ) ;

                // Declare and initialize variables:
                // n: first number from input (parsed as integer)
                // x: second number from input (parsed as integer)
                // r: counter for valid combinations, initialized to zero
                var n = + s [ 0 ] ,
                    x = + s [ 1 ] ,
                    r = 0 ;

                // Check for the termination condition: if both n and x are zero.
                if ( ! n && ! x ) {
                    // Return 1 from 'some' to stop processing further lines.
                    return 1 ;
                }

                // Outer loop: 'a' iterates from 1 up to n-2.
                // This ensures there are at least two distinct numbers left for 'b' and 'c'.
                for ( var a = 1 ; a <= n - 2 ; a ++ ) {
                    // Middle loop: 'b' iterates from 'a+1' up to n-1.
                    // 'b' must be greater than 'a' to ensure distinct combinations.
                    for ( var b = a + 1 ; b <= n - 1 ; b ++ ) {
                        // Inner loop: 'c' iterates from 'b+1' up to n.
                        // 'c' must be greater than 'b' for distinctness.
                        for ( var c = b + 1 ; c <= n ; c ++ ) {
                            // Check if the sum of a, b, and c equals the target value x.
                            // If the condition is true, increment the counter 'r'.
                            a + b + c == x && ( r ++ ) ;
                        } // End of the 'c' loop.
                    } // End of the 'b' loop.
                } // End of the 'a' loop.

                // After checking all combinations for the current line's input,
                // print the total count of valid combinations 'r' to the console.
                console . log ( r ) ;
            }
        ) ; // End of the 'some' method call.
    }
) . resume ( ) ; // Resume the standard input stream to continue listening for data.

// End of the JavaScript program.