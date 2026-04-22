/*
 * This file is a Type I clone of the original Java source code.
 * It maintains exact functional equivalence to the original.
 * All modifications are limited to whitespace (spacing, indentation, blank lines)
 * and comments (additions, removals, or alterations).
 * The underlying logic, variable names, method calls, and expressions remain precisely as they were.
 */


// Import statements for necessary Java libraries.
import java.math.BigInteger; // Essential for handling numbers that exceed the capacity of standard 'long' types.
import java.util.Scanner;    // Used for reading input from the console or other input streams.
import java.util.*;          // A wildcard import for various utility classes, though Scanner is explicitly imported.
import java.io.*;            // A wildcard import for input/output operations, like handling streams.


public   class    Main    { // The primary class containing the main execution logic.

    /**
     * The main method is the entry point for all Java applications.
     * It is where the program execution begins.
     * @param args Command-line arguments passed to the program.
     */
    public    static     void     main    ( String    [ ]    args )     {

        // Initialize a new Scanner object to read data from the standard input stream (keyboard).
        Scanner    cin     =    new    Scanner    ( System.in ) ;


        // Declare several BigInteger variables to store large integer values.
        // These variables will be used throughout the calculation process.
        BigInteger    a , n , c , d ;
        BigInteger    b , e ;


        // Read the first BigInteger value from the input and assign it to 'n'.
        n   =   cin.nextBigInteger ( ) ;

        // Read the second BigInteger value from the input and assign it to 'a'.
        // This 'a' variable represents one of the operands for subsequent operations.
        a   =   cin.nextBigInteger ( ) ; // This line captures the value for 'a'.

        // Read the third BigInteger value from the input and assign it to 'b'.
        // 'b' will serve as another operand.
        b   =   cin.nextBigInteger ( ) ;


        // Perform an addition operation: d = a + b.
        // The 'add' method of BigInteger returns a new BigInteger object representing the sum.
        d   =   a.add ( b ) ;


        // Perform a division operation: c = n / d.
        // The result of this division is stored in 'c'.
		c   =   n.divide ( d ) ;


        // Perform a multiplication operation: c = c * a.
        // The current value of 'c' is multiplied by 'a', and the new result updates 'c'.
        c   =   c.multiply ( a ) ;


        // Perform a modulo operation: e = n % d.
        // This calculates the remainder when 'n' is divided by 'd'.
        e   =   n.mod ( d ) ;


        // Conditional block based on the comparison of 'e' and 'a'.
        // The compareTo method returns -1 if e < a, 0 if e == a, and 1 if e > a.
        if    (   e.compareTo ( a )    ==    -1   )
        {
            // If 'e' is strictly less than 'a', attempt to add 'e' to 'c'.
            // Note: The result of c.add(e) is a new BigInteger and is not assigned back to 'c'.
            c.add ( e ) ;
        }
        else
        {
            // Otherwise (if 'e' is greater than or equal to 'a'), attempt to add 'a' to 'c'.
            // Note: Similarly, the result of c.add(a) is not assigned back to 'c'.
            c.add ( a ) ;
        }


        // Print the final value of 'c' to the console.
        // System.out.println automatically appends a newline character after the output.
        System.out.println ( c ) ; // Outputting the computed BigInteger 'c'.


    } // End of the main method.

} // End of the Main class definition.