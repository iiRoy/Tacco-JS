/*
 * This JavaScript file implements a function 'Main' that processes
 * a string input to determine if it meets specific criteria related
 * to palindromes and unique character counts within its halves.
 *
 * It's designed to be executed in a Node.js environment, reading
 * input from standard input.
 *
 * Author: Code Clone Generator
 * Version: 1.0
 * Date: 2023-10-27
 */

// The primary function 'Main' accepts a single argument, 'arg',
// which is expected to be a string containing lines of input.
function Main ( arg )
{
    // Initialize a variable 'S'.
    // First, 'arg' is split by newline characters, and the first line is selected.
    // Then, this selected line is split into an array of individual characters.
    var S = arg . split ( "\n" ) [ 0 ] . split ( "" ) ;

    // Check if the total number of characters in 'S' is an even number.
    if ( S . length % 2 == 0 )
    {
        // If the length is even, we proceed to divide the string into two parts.
        // 'a' will contain the characters from the beginning up to
        // the character just before the exact middle point of the first half.
        var a = S . slice ( 0 , S . length / 2 - 1 ) ;

        // 'b' will contain the characters from the beginning up to the
        // middle point of the string (representing the first half),
        // and then this segment is reversed.
        var b = S . slice ( 0 , S . length / 2 ) . reverse ( ) ;

        // Compare the string representations of 'a' and 'b'.
        // This checks if the initial part of the string (excluding a potential
        // middle character if it were odd) is a palindrome of its corresponding
        // reversed section.
        if ( a . toString ( ) === b . toString ( ) )
        {
            // If the string representations match, convert both 'a' and 'b'
            // into Set objects. This allows for easy counting of unique characters.
            a = new Set ( a ) ;
            b = new Set ( b ) ;

            // After converting to Sets, check if both 'a' and 'b' each contain
            // only one unique character. This implies that the original
            // segments were composed entirely of identical characters (e.g., "xxx" and "xxx").
            if ( a . size == 1 && b . size == 1 )
            {
                // If both conditions (palindrome-like and single unique character in halves)
                // are met, print "NO" to the console.
                console . log ( "NO" ) ;
                // Terminate the execution of the 'Main' function.
                return ;
            }
        }
    }
    // If the length of 'S' is not even, it must be an odd number.
    else
    {
        // For odd length strings, 'a' will contain characters from the beginning
        // up to the character just before the true middle character.
        var a = S . slice ( 0 , ( ( S . length - 1 ) / 2 ) ) ;

        // 'b' will contain characters starting from the character just after
        // the true middle character, up to the end of the string, and then reversed.
        var b = S . slice ( ( ( S . length - 1 ) / 2 ) + 1 ) . reverse ( ) ;

        // As with the even length case, compare the string representations
        // of 'a' and 'b' for a palindrome-like check.
        if ( a . toString ( ) === b . toString ( ) )
        {
            // Convert 'a' and 'b' into Set objects to count their unique characters.
            a = new Set ( a ) ;
            b = new Set ( b ) ;

            // Check if both 'a' and 'b' (as Sets) contain only one unique character.
            if ( a . size == 1 && b . size == 1 )
            {
                // If this condition is met, print "NO" to the console.
                console . log ( "NO" ) ;
                // Exit the function.
                return ;
            }
        }
    }

    // If none of the specific "NO" conditions were triggered throughout
    // the 'if-else' structure, it means the string does not meet those criteria.
    // In this general case, print "YES" to the console.
    console . log ( "YES" ) ;
    // Explicitly return from the function.
    return ;
}

// --- Program Execution Start Point ---
// This line invokes the 'Main' function.
// It reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string using Node.js's built-in 'fs' module.
// The read content is then passed as the 'arg' parameter to 'Main'.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.