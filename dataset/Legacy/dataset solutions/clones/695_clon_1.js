/*
 * This is a Type I clone of a Java program.
 * It demonstrates extensive whitespace and comment modifications
 * while preserving the exact original logic and identifiers.
 */
// Package imports are typically at the top of the file.
import java.util.Scanner;

// Declaration of the main class for the program.
public class Main
{
    // The entry point of the application.
    public static void main ( String   []   agrs )
    {
        // Initialize a Scanner object to read input from the console.
        Scanner sc = new Scanner( System . in );

        // Declare integer variables 'n' and 'r'.
        int   n , r ;

        // This loop runs indefinitely until a specific break condition is met.
        while ( true )
        {
            // Read the first integer value into 'n'.
            n = sc . nextInt ( ) ;

            // Declare and initialize an integer array named 'number' with size 'n'.
            int [ ] number = new int [ n ] ;

            // Populate the 'number' array with values from 'n' down to 1.
            for ( int   i = 0 ;   i < n ;   i++ )
            {
                number [ i ] = n - i ;
            } // End of population loop.

            // Read the second integer value into 'r'.
            r = sc . nextInt ( ) ;

            // Check for the termination condition: if both 'r' and 'n' are zero.
            if ( r == 0 && n == 0 )
                break ; // Exit the 'while' loop.


            // This loop performs 'r' operations based on subsequent inputs.
            for ( int   i = 0 ;   i < r ;   i++ )
            {
                // Read 'p' and adjust it for 0-based indexing.
                int   p = sc . nextInt ( ) - 1 ;

                // Read 'c'.
                int   c = sc . nextInt ( ) ;

                // Create a temporary array to hold 'p' elements.
                int [ ] temp = new int [ p ] ;

                // Copy the first 'p' elements from 'number' to 'temp'.
                for ( int   j = 0 ;   j < p ;   j++ )
                    temp [ j ] = number [ j ] ;

                // Shift elements in 'number' to the left by 'p' positions.
                // This effectively moves elements from index 'p' to 'p+c-1' to '0' to 'c-1'.
                for ( int   j = 0 ;   j < c ;   j++ )
                    number [ j ] = number [ j + p ] ;

                // Insert the elements from 'temp' back into 'number' starting at index 'c'.
                for ( int   j = 0 ;   j < p ;   j++ )
                    number [ j + c ] = temp [ j ] ;
            } // End of operations loop.

            // Print the first element of the 'number' array to the console.
            System . out . println ( number [ 0 ] ) ;

        } // End of infinite 'while' loop.
    } // End of main method.

} // End of Main class definition.