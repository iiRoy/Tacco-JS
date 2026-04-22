/*
 * This JavaScript code processes input from standard input.
 * It's designed to manipulate a string 'a' based on various input lines.
 * The 'm' variable acts as a state flag for processing logic.
 */
process
    .stdin
    .on (
        "data", /* Event listener for incoming data chunks */
        function ( c ) {
            // Declare and initialize variables for the current processing context
            var a = ""
              , m = 0
            ;

            /*
             * Convert the input chunk 'c' to a string explicitly,
             * trim any leading/trailing whitespace, and then split it into individual lines
             * based on the newline character.
             * The 'some' method is used to iterate over these lines; it will stop
             * iteration as soon as its callback function returns a truthy value.
             */
            ( c + "" )
                .trim()
                .split ( "\n" )
                .some (
                    function ( s ) { /* 's' represents a single line of input being processed */

                        // Check if the current line is the special termination signal
                        if ( s === "-" ) {
                            console.log ( a ) ; // Output the currently accumulated string 'a'
                            return 1 ;          // Return a truthy value to stop the 'some' loop
                        }

                        // Check if the line 's' contains any non-digit characters
                        if ( /\D/ .test ( s ) ) {
                            // If 'a' has a value (is not an empty string), print it before resetting
                            a && console.log ( a ) ;
                            m = 1 ; // Update the state flag to 1
                            a = s ; // Set 'a' to the current line 's'
                        }
                        // If the line 's' contains only digits (or is empty) and the state 'm' is currently 1
                        else if ( m == 1 ) {
                            m = 2 ; // Update the state flag to 2
                        }
                        // This 'else' block handles cases where 's' contains only digits
                        // and 'm' is neither 1 (meaning it's 0 or 2, or some other unexpected value)
                        else {
                            /*
                             * Perform a string manipulation:
                             * It takes a slice of 'a' from the index specified by '+s' (converting 's' to number),
                             * and concatenates it with a slice of 'a' from the beginning up to the index specified by '+s'.
                             * This effectively rotates the string 'a' by '+s' positions.
                             */
                            a = a .slice ( +s ) + a .slice ( 0 , +s ) ;
                        }
                    }
                )
            ; /* End of the .some() method call chain */

        }
    )
    .resume (
    ) // Ensures that the standard input stream remains open to continue receiving data
; // End of the entire statement chain