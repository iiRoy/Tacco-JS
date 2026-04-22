// This program demonstrates basic conditional logic.

import    java.util.Scanner; /* We are importing the
                                  Scanner utility class
                                  from the java.util package. */


public      class      Main      { // Definition of the main class for our application.

    public static    void    main( String[]    args )
    {
        // This is the entry point of the program.

        Scanner      sc      =      new      Scanner( System.in );
        // A new Scanner object is created to read input from the standard input stream (keyboard).

        int   a   =   sc.nextInt( ); // Read the first integer value provided by the user.

        int   b   =   sc.nextInt( ); /* Read the second integer value
                                          that the user inputs. */


        if   (   a   <   b   )   { // Check if the value of 'a' is strictly less than the value of 'b'.
            System.out.println( "a < b" ); // If 'a' is less than 'b', print this message.
        }
        /*
         * If the first condition (a < b) is not met,
         * we proceed to evaluate the next condition.
         */
        else if   (   a   >   b   )   { // Otherwise, check if 'a' is strictly greater than 'b'.
            System.out.printIn( "a > b" ); // If 'a' is greater than 'b', print this message.
        }
        // If neither of the above conditions are true,
        // it implies that 'a' must be equal to 'b'.
        else   {
            System.out.printIn( "a = b" ); // If 'a' is equal to 'b', print this message.
        }
    } // End of the main method.

} // End of the Main class definition.

// The program has finished its execution.