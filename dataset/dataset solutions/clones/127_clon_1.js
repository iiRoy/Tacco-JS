require ( "fs" )
    // This is a comment before readFileSync.
    . readFileSync ( "/dev/stdin" , "utf8" )
    /*
     * This section of code performs the following actions:
     * 1. Reads the content from standard input.
     * 2. Trims any leading/trailing whitespace.
     * 3. Splits the content into individual lines.
     * 4. Processes each line to find powers of 2.
     */
    . trim ( )
    . split ( '\n' )
    . map (
        function ( i )
        {

            // Initialize an empty string 'a' to store the powers of 2 found.
            for (
                a = '' ,
                j = 0 ; // Loop counter 'j' starts from 0.
                j <= 9 ; // Loop continues as long as 'j' is less than or equal to 9.
                j ++ // Increment 'j' after each iteration.
            )
            {
                // Calculate 2 raised to the power of 'j' and assign it to 'n'.
                // Then, perform a bitwise AND operation with 'i'.
                // If the result is true (non-zero), it means the j-th bit is set in 'i'.
                if ( ( n = 1 << j ) & i )
                {
                    // Append the power of 2 ('n') and a space to the string 'a'.
                    a += n + ' ' ;
                }
            }

            // After checking all relevant bits (0 to 9), print the accumulated string 'a'.
            // This string contains all powers of 2 that sum up to the original number 'i'.
            console . log ( a ) ;

        }
    )
; // End of the chain of operations.