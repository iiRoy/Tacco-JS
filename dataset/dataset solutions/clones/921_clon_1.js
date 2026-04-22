/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly as they were.
 * Significant changes have been made to whitespace (indentation, spacing, blank lines)
 * and comments (added, modified) to create a visually distinct but logically identical version.
 */

// Declare a variable 'input' and assign it the content read from /dev/stdin.
// The 'fs' module is used for file system operations.
var    input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Declare an array 'arr'.
// Trim whitespace from 'input' and then split it into lines based on the newline character.
var arr = input . trim ( ) . split ( "\n" ) ;

// Declare variable 'n'.
// Remove the first element from 'arr' (which represents 'n' from the problem statement)
// and assign it to 'n'. Note that 'n' is not used further in this specific logic.
var      n = arr . shift ( ) ;

// Declare variable 'str'.
// Remove the new first element from 'arr' (the actual string to be processed)
// and assign it to 'str'.
var str = arr . shift ( ) ;

// Begin a loop that continues as long as the length of 'str' is not equal to 1.
while ( str . length != 1 )
{

    // Inside the loop, the 'str' variable is updated.
    // The 'replace' method is used with a regular expression '/../' to match the first two characters.
    // A function is provided as the replacer, taking the matched substring 's' as an argument.
    str = str . replace ( /../ , function ( s )
    {
        // Conditional logic based on the two-character substring 's'.
        // If 's' is "TT", the function returns "T".
        if ( s == "TT" )
        {
            return "T" ;
        }

        // If 's' is "TF", the function returns "F".
        if ( s == "TF" )
        {
            return "F" ;
        }

        // If 's' is "FT", the function returns "T".
        if ( s == "FT" )
        {
            return "T" ;
        }

        // This condition is a duplicate of the second 'if' but with a different return value.
        // In JavaScript, the first matching 'if' block will execute, so this specific
        // 'if (s == "TF") return "T";' will only be reached if the preceding 'if (s == "TF") return "F";'
        // was not hit, which is impossible if 's' is "TF". This maintains the original code's exact structure.
        if ( s == "TF" )
        {
            return "T" ;
        }
    } ) ;
}

// After the loop finishes (when 'str' has a length of 1),
// print the final value of 'str' to the console.
console . log ( str ) ;