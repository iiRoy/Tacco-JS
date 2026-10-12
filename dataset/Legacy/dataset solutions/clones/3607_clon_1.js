/*
 * This is a simple Java program for demonstration purposes.
 * It reads an integer from the console and checks if it's even or odd.
 */

// Import the 'java.util' package, which contains the Scanner class for input operations.
import   java.util.*;

// Define the main class named 'Exercise49'.
public   class   Exercise49   {

        // This is the main method, the entry point for program execution.
        public static   void   main(String[]   args)
        {
                // Create a new Scanner object to read input from the standard input stream (console).
                Scanner   in   =   new   Scanner(System.in);

                // Print a prompt message to the console, asking the user to input a number.
                System.out.print("Input a number: ");

                // Read the next integer token from the input and store it in the 'n' variable.
                int   n   =   in.nextInt();   /* User input number */

                // Start an 'if' statement to check for a condition.
                // The condition checks if 'n' is perfectly divisible by 2 (i.e., 'n' is an even number).
                if   (   n   %   2   ==   0   )
                {
                        // If the condition (n is even) is true, print '1' to the console.
                        System.out.println(1);
                }
                // The 'else' block is executed if the 'if' condition is false (i.e., 'n' is an odd number).
                else
                {
                        // If 'n' is odd, print '0' to the console.
                        System.out.println(0);
                } // End of the if-else conditional block.

        }   // End of the 'main' method.

}   // End of the 'Exercise49' class definition.