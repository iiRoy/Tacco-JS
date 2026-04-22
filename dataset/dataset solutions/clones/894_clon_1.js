/*
 * This JavaScript file processes an input string to find a specific anagram
 * and replace it with another string.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Import the 'fs' (file system) module to read input.
// This line reads data from '/dev/stdin', which is standard input.
var input   =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Initialize a variable 's' with the trimmed input string.
// .trim() removes leading/trailing whitespace.
var s   =   input . trim ( ) ;

// This loop iterates through the string 's' to find a specific sequence of characters.
// The loop condition 's.length - 7' ensures there are always 8 characters remaining
// from the current index 'i' for processing.
for ( var   i   =   0 ;   i   <   s . length   -   7 ;   i ++ )
{
    // Create an array 'arr' containing 8 characters starting from the current index 'i'.
    // These 8 characters form a potential candidate sequence.
    var   arr   =   [
        s [ i ] ,
        s [ i + 1 ] ,
        s [ i + 2 ] ,
        s [ i + 3 ] ,
        s [ i + 4 ] ,
        s [ i + 5 ] ,
        s [ i + 6 ] ,
        s [ i + 7 ]
    ] ;

    // Sort the characters in 'arr' alphabetically and then join them back into a string 'str'.
    // This effectively creates a canonical representation (anagram) of the 8-character sequence.
    var   str   =   arr . sort ( ) . join ( "" ) ;

    // Check if the sorted string 'str' matches the specific target anagram "AADINNUY".
    if ( str   ==   "AADINNUY" )
    {
        // If a match is found, replace the original 8-character sequence in 's'
        // with the string "AIZUNYAN".
        // The s.slice(0,i) takes the part before the match.
        // "AIZUNYAN" is the replacement string.
        // s.slice(i+8,s.length) takes the part after the matched sequence.
        s   =   s . slice ( 0 ,   i )   +   "AIZUNYAN"   +   s . slice ( i   +   8 ,   s . length ) ;

        // Advance the loop counter 'i' by 8 positions.
        // This is done to skip over the just-replaced sequence and prevent re-processing
        // parts of it or overlapping replacements.
        i   +=   8 ;
    }
}

// After the loop completes, print the final modified string 's' to the console (standard output).
console . log ( s ) ;

// End of script.
/*
 * This program demonstrates string manipulation and pattern matching.
 */