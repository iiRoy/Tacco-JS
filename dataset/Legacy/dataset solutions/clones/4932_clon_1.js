/*
 * This program is designed to compare an input string
 * with a predefined constant string, character by character.
 * It counts the number of positions where the characters differ.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */
import    java.util.    *; // Import all utilities, specifically for Scanner.
import java.math.  *; // This import is present in the original but not used.
import    java.lang.String; // Explicitly importing the String class.
import java.lang.System;   // Explicitly importing the System class for console I/O.
import    java.lang.reflect.Array; // Another import from the original that is not utilized.

public    class    Main    {
    /*
     * The 'main' method serves as the entry point
     * for the Java application.
     * Program execution begins here.
     */
    public    static    void    main    (    String    args    [    ]    )
    {
        // Initialize a Scanner object to read input from the standard input stream (keyboard).
        Scanner    sc    =    new    Scanner    (    System.in    )    ;



        // Read a complete line of text input from the user.
        String    s    =    sc.nextLine    (    )    ;

        // Define the constant string against which the input will be compared.
        String    c    =    "CODEFESTIVAL2016"    ;



        // Convert the input string 's' into an array of single-character strings.
        String    [    ]    arrS    =    s.split    (    ""    )    ;
        // Convert the constant string 'c' into an array of single-character strings.
        String    [    ]    arrC    =    c.split    (    ""    )    ;


        // Determine the length of the constant string, which also dictates the loop's upper bound.
        int    len    =    c.length    (    )    ;
        // Initialize a counter variable to track the number of mismatches.
        int    count    =    0    ;


        // Iterate through the characters of both strings, up to the length of the constant string.
        for    (    int    i    =    0    ;    i    <    len    ;    i    ++    )
        {
            // Check if the character at the current index 'i' in arrS is NOT equal to
            // the character at the same index in arrC.
            if    (    !    arrS    [    i    ]    .equals    (    arrC    [    i    ]    )    )
            {
                // If the characters do not match, increment the counter.
                count    ++    ;
            }
        }


        // Output the final count of differing characters to the console.
        System.out.println    (    count    )    ;


    } // End of the main method.

} // End of the Main class definition.