/*  This program, a simple Java application,
 *  is designed to read a single line of text from standard input.
 *  Its primary function is to determine if the character 'C' is present
 *  in the input string, and if so, whether the character 'F' appears
 *  at an index greater than or equal to the index of 'C'.
 *  The output will be "Yes" if both conditions are met, otherwise "No".
 */
import    java.io.      *;
// The 'java.io.*' package is imported to handle input/output operations,
// specifically for reading data from the console.

public    class    Main
{
    // The main method serves as the entry point for the Java application.
    // It declares that it might throw an 'IOException' due to input operations.
    public    static    void    main    (    String    [    ]    args    )    throws    IOException
    {
        // Declare and initialize integer variables.
        // 'i' is used as a loop counter.
        // 'memo' stores the index of the first 'C' found, defaulting to 0.
        // 'flag1' indicates if 'C' has been found (1 if yes, 0 if no).
        // 'flag2' indicates if 'F' has been found after 'C' (1 if yes, 0 if no).
        int    i    ,    memo    =    0    ,    flag1    =    0    ,    flag2    =    0    ;

        // Initialize an InputStreamReader to convert byte streams to character streams.
        InputStreamReader    is    =    new    InputStreamReader    (    System.in    )    ;
        // Wrap the InputStreamReader in a BufferedReader for efficient reading of text lines.
        BufferedReader    br    =    new    BufferedReader    (    is    )    ;


        // Read a complete line of text from the console input.
        String    str    =    br    .    readLine    (    )    ;


        // Loop through each character of the input string to find the first 'C'.
        for    (    i    =    0    ;    i    <    str    .    length    (    )    ;    i    ++    )
        {
            // Extract the character at the current index.
            char    c    =    str    .    charAt    (    i    )    ;

            // Check if the current character is 'C'.
            if    (    c    ==    'C'    )
            {
                flag1    =    1    ;    // Set flag1 to 1, indicating 'C' has been found.
                memo    =    i    ;    // Store the index of this 'C' in 'memo'.
            }
        }


        // Start a new loop from the 'memo' (index of 'C') to the end of the string.
        // This loop searches for the character 'F'.
        while    (    memo    <    str    .    length    (    )    )
        {
            // Get the character at the current 'memo' position.
            char    c    =    str    .    charAt    (    memo    )    ;

            // Check if the current character is 'F'.
            if    (    c    ==    'F'    )
            {
                flag2    =    1    ;    // Set flag2 to 1, indicating 'F' has been found after 'C'.
            }

            memo    ++    ;    // Increment 'memo' to move to the next character.
        }


        // Compare the flags to determine the final output.
        // If flag1 and flag2 are both 1 (both 'C' and 'F' found in order)
        // or both 0 (neither 'C' nor 'F' found, or 'C' not found), the condition is true.
        // More accurately, it means flag1 == 1 and flag2 == 1, or flag1 == 0 and flag2 == 0.
        // The logic is that if 'C' was found (flag1=1), then 'F' *must also be found* (flag2=1) for "Yes".
        // If 'C' was not found (flag1=0), then 'F' also cannot logically satisfy the condition (flag2 will be 0).
        // So, 'flag1 == flag2' correctly checks for the pattern.
        if    (    flag1    ==    flag2    )
        {
            System    .    out    .    println    (    "Yes"    )    ;    // Print "Yes" if the pattern is matched.
        }
        else
        {
            System    .    out    .    println    (    "No"    )    ;     // Otherwise, print "No".
        }
    }
}