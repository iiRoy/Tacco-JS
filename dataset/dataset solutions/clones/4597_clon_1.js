/*
 * This is a Type I clone of an existing JavaScript program.
 * It demonstrates basic string manipulation and conditional logic.
 * All identifiers, operators, and expressions are identical to the original.
 * Only whitespace and comments have been altered significantly to create visual difference.
 */

'use strict'; // This directive ensures strict mode for better code quality and error handling.


// Define the main function that processes the input string.
function  Main ( input )
{
    // Step 1: Parse the input.
    // The input is expected to be a single line containing three space-separated strings.
    // First, split the input by newline to get the first line (index 0).
    // Then, split that line by space to separate the three string components.
    const   tmp   =   input . split ( "\n" ) [ 0 ] . split ( " " ) ;


    // Step 2: Assign the extracted components to distinct variables for clarity.
    const   A   =   tmp [ 0 ] ; // The first string provided in the input.
    const   B   =   tmp [ 1 ] ; // The second string provided in the input.
    const   C   =   tmp [ 2 ] ; // The third string provided in the input.


    // Step 3: Evaluate the specified conditions.
    // Condition 1: The last character of string A must be identical to the first character of string B.
    // Condition 2: The last character of string B must be identical to the first character of string C.
    if  (  A . slice ( -1 )  ==  B . slice ( 0 , 1 )  &&
           B . slice ( -1 )  ==  C . slice ( 0 , 1 )
    )
    {
        // If both conditions are met, print "YES" to the console.
        console . log ( "YES" ) ;
    }
    else
    {
        // If one or both conditions are not met, print "NO" to the console.
        console . log ( "NO" ) ;
    }
} // End of the Main function definition.


// This line handles the execution of the program.
// It reads the entire content of standard input (typically from a file or pipe),
// decodes it as UTF-8, and then passes it as an argument to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;