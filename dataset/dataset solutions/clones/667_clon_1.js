/*
 * This is a Type I clone of the original Java code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 */
public       class    Main
{
    // The main method: this is the entry point for the Java application.
    public static void main ( String [ ]   args )    throws IOException
    {
        // Initialize a BufferedReader to efficiently read character input from the console.
        BufferedReader   br = new BufferedReader(  new InputStreamReader ( System.in  ) );


        // Declare multiple integer variables used throughout the program.
        int j, k, i, b, c, W, N, S;

        // This is the primary outer loop. It's designed to run indefinitely
        // until an explicit 'break' statement is encountered within its body.
        for ( i = 0 ; ; i++ )
        {
            // Reset the sum variable 'S' to zero at the beginning of each outer loop iteration.
            S = 0;

            // Read a full line of text input from the user/console.
            String str1 = br.readLine ( );
            // Parse the read string into an integer, which represents 'n'.
            int    n    = Integer.parseInt ( str1 );

            // Conditional check: If the parsed integer 'n' is zero,
            // it signifies the end of input or a termination condition.
            if ( n == 0 )
            {
                break; // Exit the outer 'for' loop immediately.
            }

            // This is an inner loop that iterates a number of times
            // determined by 'n' divided by 4 (integer division).
            for ( j = 0 ; j < n / 4 ; j++ )
            {
                // Read another line of text input for the current inner loop iteration.
                String str2 = br.readLine ( );
                // Parse this second string into an integer, storing it in 'a'.
                int    a    = Integer.parseInt ( str2 );

                // Accumulate the value of 'a' into the running sum 'S'.
                S = S + a;
            }

            // After the inner loop completes, print the calculated sum 'S' to the console.
            System.out.println ( S ) ;
        } // End of the outer 'for' loop.

    } // End of the 'main' method.

} // End of the 'Main' class definition.

// End of the Java source file.