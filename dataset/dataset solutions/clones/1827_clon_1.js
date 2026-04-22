"use strict" ; /* Enable strict mode for cleaner code */


/*
 * This is the main function that processes the input argument.
 * It takes a single string `arg` as input, which is expected to be
 * the content read from standard input.
 */
const    main   =    arg    => {

    // Split the input string into an array of lines.
    // Each element in the 'lines' array will correspond to a line from the input.
    var   lines   =   arg . split ( '\n' ) ;


    // Process the first line of the input.
    // 1. Remove the first line from the 'lines' array using shift().
    // 2. Split it by spaces to get individual string components.
    // 3. Map each component to a number using the unary plus operator (+n).
    var   firstLine   =   lines . shift ( ) . split ( ' ' ) . map (  function (  n  ) {  return  +n ;  }  ) ;


    /*
     * Extract and convert the time components from the firstLine array.
     * The input format is assumed to be: H1 M1 H2 M2 K
     * where H1, M1 are hours and minutes for the first time,
     * and H2, M2 are hours and minutes for the second time.
     * K is an integer value.
     */

    // Calculate the first hour component in minutes.
    var   H1   =   firstLine [ 0 ]   *   60   ;
    // Calculate the total minutes for the first time.
    var   first   =   H1   +   firstLine [ 1 ]   ;


    // Calculate the second hour component in minutes.
    var   H2   =   firstLine [ 2 ]   *   60 ;
    // Calculate the total minutes for the second time.
    var   Second   =   H2   +   firstLine [ 3 ] ;


    // Extract the integer K.
    var   K     =   firstLine [ 4 ] ;


    // --- Conditional Logic ---
    // Compare the two calculated times and perform operations accordingly.
    if   (   first   <   Second   )   {
        // If the first time is earlier than the second time.

        // Calculate and log the difference, subtracting K.
        console . log ( Second   -   first   -   K ) ;
    }   else   {
        // If the first time is later than or equal to the second time,
        // we assume a time span across midnight.
        // There are 24 * 60 = 1440 minutes in a day. The problem context might imply 24 hours = 3600 units based on 'today' variable.
        // Assuming 24 * 60 = 1440 minutes in a day context for '3600' is a bit off, but keeping original value.
        // Based on the given '3600', this implies a different unit or a specific problem constraint.
        // We will stick to the original '3600' as per Type I definition.
        var   today   =   3600   -   first ;
        // Calculate and log the result, adding the 'today' offset and subtracting K.
        console . log ( Second   +   today   -   K ) ;
    }

} // End of main function definition


/*
 * This line executes the main function.
 * It reads the content of '/dev/stdin' (standard input) as a UTF-8 string
 * using Node.js's 'fs' module and passes it to the 'main' function.
 */
main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;