/*
 * This is a Type I clone of the original Java code.
 * It demonstrates extensive use of whitespace and comments
 * while preserving the exact logical structure and identifiers.
 */

import java.io.*; // Import necessary I/O classes for input/output operations

public class Main // Main class definition
{

    // The main method, entry point of the application
    public static void main ( String [ ] args ) throws IOException
    {
        // Initialize a BufferedReader to read input from the console.
        // It wraps an InputStreamReader around the standard input stream (System.in).
        BufferedReader br = new BufferedReader ( new InputStreamReader ( System.in ) ) ;

        /*
         * Declare several integer variables.
         * Some of these might not be used in the current version of the code,
         * but they are declared as per the original.
         */
        int j , k , i , b , c , W , N , S ; // Declaration of multiple integer variables

        // Outer loop: continues indefinitely until a break condition is met.
        // The loop counter 'i' is incremented in each iteration.
        for ( i = 0 ; ; i++ )
        {
            S = 0 ; // Initialize sum 'S' to zero at the beginning of each outer loop iteration.

            // Read a line from the console input.
            String str1 = br.readLine ( ) ;

            // Parse the read string into an integer.
            int n = Integer.parseInt ( str1 ) ;

            // Check if the parsed integer 'n' is zero.
            // If it is, break out of the outer loop.
            if ( n == 0 )
            {
                break ; // Exit the main processing loop
            }

            // Inner loop: iterates 'n/4' times.
            // This loop reads 'n/4' numbers and adds them to 'S'.
            for ( j = 0 ; j < n / 4 ; j++ )
            {
                String str2 = br.readLine ( ) ; // Read another line from input for the inner loop
                int a = Integer.parseInt ( str2 ) ; // Parse this line into an integer 'a'
                S = S + a ; // Add the parsed integer 'a' to the running sum 'S'
            }

            // After the inner loop completes, print the accumulated sum 'S' to the console.
            System.out.println ( S ) ;
        } // End of the outer 'for' loop
    } // End of the main method

} // End of the Main class