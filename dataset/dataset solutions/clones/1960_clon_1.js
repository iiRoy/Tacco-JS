/*
 * This file contains a JavaScript program.
 * It reads an integer from standard input, calculates the circumference of a circle
 * with that integer as the radius, and prints the result to standard output.
 *
 * This version is a Type I clone, preserving all original identifiers and logic,
 * while extensively modifying whitespace and adding comments.
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code execution.


// Define the main function that will process the given input.
function   Main   (   input   )
{

    // The input is expected to be a single string.
    // We split it by newline characters to handle potential multiple lines,
    // though for this specific problem, we anticipate only one line of numeric input.
    input  =  input . split ( "\n" ) ;


    // Parse the first element of the split input array as an integer.
    // The '10' argument ensures that the number is parsed in base-10.
    let   a   =   parseInt (   input [ 0 ] ,   10   ) ;


    // Calculate the circumference of a circle using the formula: 2 * PI * radius.
    // Here, 'a' represents the radius. Math.PI provides the value of Pi.
    // The result is then printed to the standard output.
    console . log (   2   *   a   *   Math . PI   ) ;

} // End of the Main function definition.


// This part of the script handles the environment-specific input reading.
// It uses Node.js's 'fs' (file system) module to synchronously read
// the content of '/dev/stdin' (standard input path on Unix-like systems).
// The input is read as a UTF-8 encoded string and then passed to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;

/*
 * End of the JavaScript program.
 * All logic from the original code has been retained without alteration.
 * Only whitespace and comments have been added or modified.
 */