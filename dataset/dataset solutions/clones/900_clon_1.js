/*
 * This JavaScript module is designed to process input from the standard input stream.
 * It listens for 'data' events, processes each chunk of data line by line,
 * and performs a specific calculation based on directional keywords.
 *
 * This version includes extensive whitespace and comments to demonstrate
 * a Type I code clone, preserving all functional aspects and identifiers.
 */


process . stdin . resume ( ) ; // Activate the standard input stream, ensuring it doesn't close immediately.


process . stdin . setEncoding ( 'utf8' ) ; /* Set the character encoding for the input stream.
                                            * 'utf8' is a common and robust choice for text processing,
                                            * allowing for a wide range of characters. */


process . stdin . on ( 'data' , function ( chunk )
{
    // Define all local variables used within this function scope.
    var line ,                                    // Holds the current line being processed from the input chunk.
        lines = chunk . split ( "\n" ) ,          // An array of strings, where each element is a line from the input 'chunk'.
        i ,                                       // Loop counter for iterating through the 'lines' array.
        len = lines . length ,                    // Stores the total number of lines obtained from the 'chunk'.
        j ,                                       // Loop counter for iterating through characters within a 'line'.
        jLen ,                                    // Stores the length of the current 'line'.
        deg ,                                     // Accumulates the calculated degree value for the current line.
        pow ,                                     // Represents the power of 2 in calculations, often related to position.
        max ;                                     // Stores the maximum possible degree value for comparison.


    /*
     * Begin iterating over each line extracted from the incoming data chunk.
     * The loop is designed to process every line unless a specific termination
     * condition (a '#' character) is met.
     */
    for ( i = 0 ; i < len ; i ++ )
    {
        line = lines [ i ] ; // Assign the current line from the array to the 'line' variable.

        // Check if the current line is the special termination character.
        if ( line == "#" )
        {
            break ; // If '#' is found, stop processing further lines in this chunk.
        }


        /*
         * Perform string replacements to convert specific directional words
         * into numerical representations. 'north' is replaced by '0',
         * and 'west' is replaced by '1'. This effectively transforms
         * the input string into a sequence that can be interpreted numerically.
         */
        line = line . replace ( /north/g , 0 ) ; // Convert all occurrences of 'north' to '0'.
        line = line . replace ( /west/g , 1 ) ;  // Convert all occurrences of 'west' to '1'.


        deg = 0 ; // Reset the degree accumulator for the processing of the new line.


        jLen = line . length ;           // Get the total number of characters in the modified line.
        pow = line . length - 1 ;        // Initialize 'pow' to the highest index, effectively (length - 1).
        max = 90 * Math . pow ( 2 , pow ) ; // Calculate the upper bound for the degree accumulation.

        /*
         * This loop iterates backwards through the characters of the processed line.
         * It interprets each character (now '0' or '1') as a bit in a positional system
         * to calculate the 'deg' value.
         */
        for ( j = jLen ; j >= 0 ; j -- )
        {
            // Check if the character at index 'j' represents a '1' (truthy when multiplied by 1).
            if ( line [ j ] * 1 )
            {
                // If it's a '1', add to the degree if it won't exceed the 'max' limit.
                if ( deg < max )
                {
                    deg += 90 * Math . pow ( 2 , j ) ; // Add a weighted value to 'deg'.
                }
            }
            else // The character must represent a '0'.
            {
                // If it's a '0', subtract from the degree if 'deg' is currently positive.
                if ( deg > 0 )
                {
                    deg -= 90 * Math . pow ( 2 , j ) ; // Subtract a weighted value from 'deg'.
                }
            }
        }

        /*
         * This section simplifies the calculated degree. If 'deg' is even and
         * 'pow' is greater than zero, both are divided by 2. This process
         * continues until 'deg' becomes odd or 'pow' reaches zero, effectively
         * simplifying a fraction (deg / 2^pow).
         */
        while ( pow > 0 && deg % 2 === 0 )
        {
            deg = deg / 2 ; // Halve the degree value.
            pow -- ;        // Decrement the power.
        }


        // Output the final calculated degree value to the console.
        if ( pow > 0 )
        {
            // If 'pow' is still greater than 0, display the result as a fraction.
            console . log ( deg + "/" + Math . pow ( 2 , pow ) ) ;
        }
        else
        {
            // Otherwise, if 'pow' is 0 or less, display only the integer degree.
            console . log ( deg ) ;
        }
    }
} ) ; // End of the event listener for 'data' on process.stdin.