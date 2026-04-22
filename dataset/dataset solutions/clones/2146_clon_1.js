/*
 * This JavaScript file contains a function to process a string input,
 * determining if exactly two of its three space-separated parts are identical.
 * It's a simple logic puzzle solver for string comparisons.
 */

// Define the main function that will process the given input string 'S'.
function Main ( S )
{
    // Declare a variable 's' and assign it an array of strings
    // by splitting the input string 'S' at each space character.
    var s = S . split ( ' ' ) ;


    // First condition check:
    // If the first part equals the second part, AND the first part is NOT equal to the third part.
    if  ( s [ 0 ]  ===  s [ 1 ]   &&   s [ 0 ]  !==  s [ 2 ] )
    {
        // If this condition is met, print 'Yes' to the console.
        console . log ( 'Yes' ) ;
    }
    // Second condition check (if the first was false):
    // If the first part equals the third part, AND the first part is NOT equal to the second part.
    else  if  ( s [ 0 ]  ===  s [ 2 ]   &&   s [ 0 ]  !==  s [ 1 ] )
    {
        // If this condition is met, print 'Yes' to the console.
        console . log ( 'Yes' ) ;
    }
    // Third condition check (if the first two were false):
    // If the third part equals the second part, AND the first part is NOT equal to the third part.
    else  if  ( s [ 2 ]  ===  s [ 1 ]   &&   s [ 0 ]  !==  s [ 2 ] )
    {
        // If this condition is met, print 'Yes' to the console.
        console . log ( 'Yes' ) ;
    }
    // Default case (if none of the above 'if' or 'else if' conditions were met):
    else
    {
        // In all other scenarios, print 'No' to the console.
        console . log ( 'No' ) ;
    }

} // End of the Main function definition.


// --- Application Entry Point ---
// This line reads input from standard input, typically used in competitive programming environments.
// It uses Node.js 'fs' module to synchronously read the content of /dev/stdin as UTF-8 encoded text.
// The read content (the string 'S') is then passed as an argument to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// --- End of Application ---