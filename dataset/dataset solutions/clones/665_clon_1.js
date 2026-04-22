/*
 * This is a Java program designed to read numerical input
 * from the standard input stream (console) and perform
 * a specific summation operation.
 *
 * The program will continue to process sets of numbers
 * until a specific termination value (zero) is encountered.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

import java.io.*; // Required for input/output operations.

public class AOJ1041 // Main class definition.
{
    // The entry point for the Java application.
    public static void main( String [ ]   args ) throws IOException // Main method signature.
    {
        // Initialize a BufferedReader to read input efficiently from the console.
        BufferedReader br =  new  BufferedReader (  new  InputStreamReader ( System.in )  ) ;

        // Declare several integer variables. Some might not be used, but are declared as in the original.
        int   j,   k,   i,   b,   c,   W,   N,   S;


        // This is the primary processing loop. It runs indefinitely until a 'break' statement is executed.
        for ( i = 0 ; ; i ++ )
        {
            // Initialize the sum variable 'S' to zero at the beginning of each iteration.
            S  =  0 ;


            // Read a line of text from the standard input.
            String   str1   =   br.readLine ( ) ;

            // Convert the read string into an integer. This value 'n' dictates further processing.
            int   n   =   Integer.parseInt ( str1 ) ;

            // Check if the read integer 'n' is zero. If it is, the program terminates its main loop.
            if ( n  ==  0 )
            {
                break ; // Exit the 'for' loop.
            }

            // This nested loop processes 'n/4' subsequent lines of input.
            // It reads integers and adds them to the running total 'S'.
            for ( j  =  0 ;   j  <  n  /  4 ;   j ++ )
            {
                // Read another line of input for the current sub-operation.
                String   str2   =   br.readLine ( ) ;

                // Parse this line into an integer.
                int   a   =   Integer.parseInt ( str2 ) ;

                // Add the parsed integer 'a' to the cumulative sum 'S'.
                S   =   S   +   a ;
            }

            // After processing all relevant sub-inputs for the current 'n', print the total sum 'S'.
            System.out.println ( S ) ;

        } // End of the main processing loop.

    } // End of the 'main' method.

} // End of the 'AOJ1041' class definition.