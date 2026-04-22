/*
 * This script processes data from standard input (stdin).
 * It listens for incoming data chunks, processes each chunk by
 * converting it to a string, trimming whitespace, and splitting
 * it into individual lines based on the newline character.
 *
 * For each line that represents a valid non-zero number,
 * it prints a formatted output indicating the "Case" number
 * (1-based index) and the value of the line.
 * Lines that are not valid numbers (e.g., empty, non-numeric)
 * are skipped.
 */


// Begin listening for 'data' events on the standard input stream.
process . stdin . on (

    "data" ,

    // This anonymous function serves as the event handler for incoming data chunks.
    // It receives a single argument 'c', which is the data chunk.
    function ( c )
    {

        // The received data chunk 'c' is first converted to a string using concatenation with an empty string.
        // Then, leading and trailing whitespace is removed using .trim().
        // The resulting string is split into an array of lines using .split("\n").
        // Finally, the .some() method is used to iterate over each line.
        // The return value of .some() is not utilized here; it's used for iteration side effects.
        ( c + "" ) . trim ( ) . split ( "\n" ) . some (

            // This nested anonymous function is the callback for the .some() method.
            // It processes each line 'a' with its corresponding index 'i'.
            function ( a , i )
            {

                // Check if the current line 'a' cannot be interpreted as a valid number.
                // The unary plus operator (+a) attempts to convert 'a' to a number.
                // If 'a' is an empty string, non-numeric, or evaluates to zero,
                // then !+a will be true.
                if ( ! + a )
                {
                    // If the line is not a valid positive number,
                    // or if it's an empty line, skip further processing for this line.
                    return ;
                }


                // If the line 'a' is a valid number,
                // print a formatted output to the console.
                // 'i + 1' calculates the 1-based case number.
                console . log ( "Case" , i + 1 + ":" , a ) ;

            } // End of the inner 'some' callback function.

        ) ; // End of the .some() method call.

    } // End of the 'data' event handler function.

) . resume ( ) ; // After setting up the event listener, call .resume() to ensure
                 // the stdin stream is flowing and emitting 'data' events.

// End of the script's main execution flow.