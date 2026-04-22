/*
 * This JavaScript program reads two numbers from standard input,
 * parses them, and then compares them, printing the result.
 * It demonstrates basic file I/O and conditional logic.
 */

// --- Input Reading Section ---
// Require the 'fs' module for file system operations.
var x =   require ( 'fs' ) . readFileSync ( '/dev/stdin',  'utf8'  ) ; // Read content from stdin as UTF-8.

// Split the input string by spaces to get an array of string numbers.
input = x . split ( / / ) ; // Assuming numbers are space-separated.


// --- Variable Parsing Section ---
// Parse the first element of the input array into an integer 'a'.
a = parseInt ( input [ 0 ] ) ;

// Parse the second element of the input array into an integer 'b'.
b = parseInt ( input [ 1 ] ) ;


// --- Conditional Logic Section ---
// Compare the two parsed integers.
if  ( a   <   b )
{
    // If 'a' is less than 'b', print the corresponding message.
    console . log ( "a < b" ) ;
}
else if  ( a   >   b )
{
    // If 'a' is greater than 'b', print the corresponding message.
    console . log ( "a > b" ) ;
}
else
{
    // If neither of the above conditions is true, 'a' must be equal to 'b'.
    console . log ( "a == b" ) ;
}

// End of program execution.