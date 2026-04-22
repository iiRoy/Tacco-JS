import java.util.*; /* This import is for the Scanner class and other utility features. */
import java.math.*; // This import is for mathematical operations, not strictly used here but kept.

/**
 * This is the main class that contains the program logic.
 * It processes a string based on specific rules to determine a winner.
 */
public class Main
{
    // The entry point of the application.
    public static void main( String[ ] args )
    {
        // Create a new Scanner object to read input from the standard input stream.
        Scanner sc = new Scanner( System.in );

        // Read the next token (word) from the input and store it in a String variable.
        String str = sc.next();

        // Initialize a StringBuffer with the input string.
        // StringBuffer is used as characters will be deleted, requiring mutable sequence.
        StringBuffer a = new StringBuffer( str );


        // A boolean flag to track whose "turn" it is or who is currently "winning".
        // It starts as true, representing the second player's initial state.
        boolean flag = true;

        // Begin an infinite loop for the game simulation.
        // The loop will be explicitly broken when no more moves are possible.
        while ( true )
        {
            // Get the current length of the mutable string buffer 'a'.
            // This value might change in each iteration of the outer loop.
            int n = a.length();

            // A secondary flag to detect if any modification (character deletion)
            // occurred during the current iteration of the inner loop.
            int flag2 = 0;

            // Iterate through the string buffer from the second character up to the second-to-last character.
            // Characters at index 0 and n-1 are not considered for deletion directly.
            for ( int i = 1 ; i < n - 1 ; i++ )
            {
                // Check the condition for deletion: if the character before 'i'
                // is different from the character after 'i'.
                if ( a.charAt( i - 1 ) != a.charAt( i + 1 ) )
                {
                    // If the condition holds, delete the character at the current index 'i'.
                    a.deleteCharAt( i );

                    // Toggle the main 'flag' to switch the state (e.g., player's turn).
                    flag = ! flag;

                    // Set flag2 to 1 to signify that a deletion has taken place.
                    flag2 = 1;

                    // Break out of the inner 'for' loop. Only one deletion per outer loop iteration.
                    break;
                }
            } // End of the inner 'for' loop.

            // After checking all possible deletions in the current string state:
            // If flag2 is still 0, it means no characters were deleted in this iteration.
            if ( flag2 == 0 )
            {
                // If no deletion occurred, the game has reached a stable state.
                // Break out of the infinite 'while' loop to end the game.
                break;
            }
        } // End of the outer 'while' loop.


        // After the game loop concludes, determine the winner based on the final state of 'flag'.
        if ( flag )
        {
            // If 'flag' is true, the "Second" player wins.
            System.out.println( "Second" );
        }
        else
        {
            // If 'flag' is false, the "First" player wins.
            System.out.println( "First" );
        }
    } // End of the 'main' method.
} // End of the 'Main' class definition.