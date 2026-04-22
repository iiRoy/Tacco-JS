/*
 * This JavaScript file contains the implementation of the Main function.
 * It processes an input string to determine a specific pattern based on character sets.
 *
 * This code is a Type I clone, meaning only whitespace and comments have been altered.
 * No logical or structural changes have been made to the original source.
 */

function   Main  ( arg ) // Main entry point function definition
{
    // Initialize variable 'S' by processing the input argument 'arg'.
    // First, split the input by newline characters, take the first line,
    // and then split that line into an array of individual characters.
    var    S    =    arg . split ( "\n" ) [ 0 ] . split ( "" ) ;


    // Check if the length of the character array 'S' is an even number.
    if  ( S . length  %  2  ==  0 )
    {
        // This block handles the case where the input string length is even.

        // Create a slice 'a' from the beginning of 'S' up to (S.length / 2 - 1).
        var    a    =    S . slice ( 0 ,  S . length  /  2  -  1 ) ;
        // Create another slice 'b' from the beginning of 'S' up to (S.length / 2).
        var    b    =    S . slice ( 0 ,  S . length  /  2 ) ;


        // Convert the array 'a' into a Set to store only unique characters.
        a    =    new  Set ( a ) ;
        // Convert the array 'b' into a Set to store only unique characters.
        b    =    new  Set ( b ) ;

        // Check if both sets 'a' and 'b' contain exactly one unique character each.
        if   ( a . size  ==  1   &&   b . size  ==  1 )
        {
            // If both conditions are met, print "NO" to the console.
            console . log ( "NO" ) ;
            return ; // Exit the Main function early.
        }
    }
    else // This block executes if 'S.length' is an odd number.
    {
        // This block handles the case where the input string length is odd.

        // Create a slice 'a' from the beginning up to the middle element (exclusive).
        var    a    =    S . slice ( 0 ,  ( ( S . length - 1 )  /  2 ) ) ;
        // Create another slice 'b' from the element after the middle up to the end of 'S'.
        var    b    =    S . slice ( ( ( S . length - 1 )  /  2 )  +  1 ) ;


        // Convert array 'a' into a Set to identify unique characters within it.
        a    =    new  Set ( a ) ;
        // Convert array 'b' into a Set to identify unique characters within it.
        b    =    new  Set ( b ) ;

        // Check if both sets 'a' and 'b' each contain only one unique character.
        if   ( a . size  ==  1   &&   b . size  ==  1 )
        {
            // If the condition is true, output "NO" to the standard output.
            console . log ( "NO" ) ;
            return ; // Terminate the function's execution.
        }
    }
    // If the function has not returned by now, it means the conditions for "NO" were not met.
    // In this case, print "YES" to the console.
    console . log ( "YES" ) ;
    return ; // Final return from the Main function.
}

// Call the Main function with input read from standard input.
// This line uses the 'fs' module to synchronously read the content of '/dev/stdin' as UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;
// End of the JavaScript program.