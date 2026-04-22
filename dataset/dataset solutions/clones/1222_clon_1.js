'use strict' ; /* This directive enables strict mode for the entire script. */
// Immediately Invoked Function Expression (IIFE) to encapsulate the code.
( function (   stdin   )   {

    // Declare a variable to hold the raw input from stdin.
    var inputs = stdin . toString ( ) ;


    // Process the input:
    // 1. Split by newline to get lines.
    // 2. Take the first line (index 0).
    // 3. Split the first line by space to get individual numbers as strings.
    // 4. Map each string to its Number representation.
    var cols = inputs . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( Number ) ;

    /*
     * Extract the individual numbers from the 'cols' array.
     * These likely represent three distinct integer values.
     */
    var a = cols [ 0 ] ; // First number
    var b = cols [ 1 ] ; // Second number
    var c = cols [ 2 ] ; // Third number


    // Declare variables for smallest (s), middle (m), and largest (l) values.
    var s , m , l ;


    // Determine the smallest value using Math.min.
    s = Math . min ( a , b , c ) ;

    /*
     * Determine the largest value using Math.max.
     * Note: The original code assigns 'l' here, not 'L'.
     */
    l = Math . max ( a , b , c ) ;


    // Logic to find the middle value 'm'.
    // This sequence of if statements is peculiar and might not correctly
    // identify the true "middle" value if there are duplicates or specific orderings.
    // It's a direct clone of the original logic.

    if ( a < b ) {
        // If 'a' is less than 'b', tentatively set 'm' to 'a'.
        m = a ;
    } // End of first conditional block.

    // This is a separate, independent 'if' statement.
    if ( b < c ) {
        // If 'b' is less than 'c', tentatively set 'm' to 'b'.
        // This might overwrite the previous 'm' assignment.
        m = b ;
    } // End of second conditional block.

    // This is yet another separate, independent 'if' statement.
    if ( a <= c ) {
        // If 'a' is less than or equal to 'c', tentatively set 'm' to 'c'.
        // This might overwrite any previous 'm' assignment again.
        // The final value of 'm' depends on the order and truthiness of these three 'if's.
        m = c ;
    } // End of third conditional block.

    // Output the calculated smallest, middle (as per the logic above), and largest values.
    console . log ( s , m , l ) ;

    // The IIFE is immediately invoked with the content of '/dev/stdin'.
} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // End of IIFE and its invocation.