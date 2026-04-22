/*
 * This is a JavaScript file demonstrating
 * a simple string manipulation program.
 * It's designed to process input from stdin.
 */
"use strict"; // Enforce strict mode for safer coding.


// Define the main function that processes the input argument.
const   main  =   arg   =>  {

    // Trim leading/trailing whitespace and split the input string by newlines.
    arg  =  arg . trim ( ) . split ( "\n" ) ;


    // Take the first line of the input and split it into an array of characters.
    const   S   =   arg [ 0 ] . split ( "" ) ;


    // Remove the last 8 characters from the array S.
    // S.length - 8 calculates the starting index.
    // 8 is the number of elements to remove.
    // "" is the element(s) to insert (in this case, none, effectively deleting).
    S . splice ( S . length   -   8 ,   8 ,   "" ) ;


    // Log the modified character array joined back into a single string to the console.
    console . log ( S . join ( "" ) ) ;
} // End of main function definition.


// Call the main function with the content read from standard input.
// require('fs') gets the file system module.
// .readFileSync('/dev/stdin', 'utf8') reads the entire content of stdin as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// End of script.