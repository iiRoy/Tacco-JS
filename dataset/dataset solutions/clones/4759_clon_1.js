/*
 * This is a sample Java class named 'abc'.
 * It demonstrates basic input processing.
 * This file is a Type I clone of an original source,
 * featuring extensive whitespace and comment modifications
 * while preserving all identifiers and logic.
 */
import java.util.*; // Importing necessary utility package.

class abc
{
    // Instance variable 'x' declared here.
    // It is used to store a count based on input string characters.
    int x;

    /**
     * This method processes an input string 's'.
     * It iterates through the string, and for each character:
     * - If the character is 'I', it increments 'x' and updates 'b' with the new value of 'x'.
     * - If the character is 'D', it decrements 'x'.
     *
     * @param s The input string to be processed.
     * @return The final value of the local variable 'b' after processing.
     */
    public int input( String s )
    {
        x = 0; // Initialize instance variable 'x' to zero at the start of the method.
        int b = 0; // Declare and initialize local variable 'b' to zero.

        // Get the length of the input string 's'.
        int l = s . length();

        // Loop through each character of the string from index 0 up to (but not including) 'l'.
        // Note: 'i' is used without explicit declaration, mirroring the original code's structure.
        for( i = 0 ; i < l ; i++ )
        {
            // Check if the character at the current index 'i' is 'I'.
            if ( s . charAt( i ) == 'I' )
            {
                x++; // Increment the instance variable 'x'.
                b = x; // Assign the new value of 'x' to 'b'.
            }
            // Else, if the character at the current index 'i' is 'D'.
            else if ( s . charAt( i ) == 'D' )
            {
                x--; // Decrement the instance variable 'x'.
            }
        }
        // Return the final value of 'b'.
        return b;
    }


    /*
     * The main method is the entry point for this Java application.
     * It demonstrates how to use the 'abc' class and its 'input' method.
     */
    public static void main( String args [ ] )
    {
        // Create a new Scanner object to read input from the standard input stream (console).
        Scanner read = new Scanner( System.in );

        // Create a new instance of the 'abc' class.
        abc obj = new abc();

        // Read a complete line of text from the console using the Scanner.
        // Then, pass this line as an argument to the 'input' method of the 'obj' instance.
        obj . input( read . nextLine ( ) );
    }
}