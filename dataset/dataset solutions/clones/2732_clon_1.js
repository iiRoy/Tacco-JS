/* This is a Type I clone example generated for demonstration purposes. */
// The primary goal is to introduce extensive whitespace and comment variations.

'use strict' ; //   This directive enforces stricter parsing and error handling in the code.


function   main   (   input   )    /*  The main function that processes the input.  */
{
    // --- Variable Declarations and Input Processing ---

    // Trim whitespace from the input string and split it into an array of strings.
    const   arr   =   input . trim ( ) . split ( ' ' ) ;

    // Convert the first element of the array to a number and assign it to 'a'.
    const   a   =   Number ( arr [ 0 ] ) ;

    // Convert the second element of the array to a number and assign it to 'b'.
    const   b   =   Number ( arr [ 1 ] ) ;


    // --- Core Logic and Output ---

    // Calculate the ceiling of 'a' divided by the product of 'b' and 2.
    // Then, log the computed result to the console.
    console . log ( Math . ceil ( a / ( b * 2 ) ) ) ;
}


/*
 *  This section handles the execution of the main function.
 *  It reads input from standard input using Node.js's 'fs' module.
 */
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; //   Call the main function with the data read from stdin.

//   End of the JavaScript file.