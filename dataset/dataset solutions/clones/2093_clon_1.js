/*
 * This file contains a JavaScript program to determine if
 * the first three characters of an input string are all identical.
 * It's a simple character comparison logic.
 */

// Define the main function that processes the input data.
function Main( input )
{

    // The 'input' parameter receives the entire input data as a string.

    // Split the input string into individual characters
    // and store them in an array named 's'.
    var    s    =    input.split( "" )   ;


    // Check if the first character is identical to the second AND
    // if the first character is identical to the third.
    // In other words, check if s[0] == s[1] == s[2].
    if  ( s[0]  ==  s[1]   &&   s[0]  ==  s[2]  )
    {
        // If all three characters are the same, print "No".
        console.log( "No" ) ;
    }
    else
    {
        // Otherwise (if they are not all the same), print "Yes".
        console.log( "Yes" ) ;
    }

} // End of Main function definition.


// Read the input from standard input and pass it to the Main function.
// This is the entry point for execution in this environment.
Main(  require( "fs" ).readFileSync( "/dev/stdin" ,  "utf8" )  ) ;