/*
 * This is a Type I clone of the original Java code.
 * According to the definition, only whitespace and comments
 * are permitted to change. All other elements remain identical.
 */
public   class   Main
{
    // This is the main method, the entry point for the Java application.
    public   static   void    main   (   String [ ]   args   )
    {

        // We check if the number of command-line arguments provided is exactly two.
        if (   args.length   ==   2   )
        {

            // Declare an integer variable 'A' and assign it the value
            // obtained by converting the first command-line argument (at index 0)
            // from a String to an Integer.
            int   A   =   Integer.valueOf ( args [ 0 ] )   ;
            // Similarly, declare an integer variable 'B' and assign it the value
            // obtained by converting the second command-line argument (at index 1)
            // from a String to an Integer.
            int   B   =   Integer.valueOf ( args [ 1 ] )   ;


            // Declare an integer variable 'num'.
            // Its value is calculated by performing floor division of B by A,
            // and then adding 1 to the result.
            // Math.floorDiv ensures the division result is an integer rounded towards
            // negative infinity.
            int   num   =   Math.floorDiv ( B , A )   +   1   ;


            // Finally, print the calculated value of 'num' to the standard output.
            System.out.println ( num )   ;
        }
    } // End of main method
} // End of Main class definition