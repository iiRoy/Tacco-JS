/*
 * This script reads input from standard input,
 * processes each line to check for balanced brackets.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' (file system) module to read input.
var      input    =    require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  ) ;


// Trim whitespace from the input and split it into an array of lines.
var      Arr    =    ( input . trim ( ) ) . split ( "\n" ) ;

/**
 * Iterate through each line of the input array.
 * Each line is treated as a separate string to be processed.
 */
for  (   var     i    =    0  ;   i   <   Arr . length   ;   i ++   )
{
        // Get the current string from the array.
        var    str    =    Arr [ i ] ;

        // Remove all alphabetic characters, periods, and whitespace from the string.
        str    =    str . replace (  / [ a-zA-Z ] | \. | \s / g  ,  ""  ) ;

        /*
         * Continuously remove empty bracket pairs ([], ())
         * until no more such pairs can be found in the string.
         * This effectively checks for balanced brackets.
         */
        while  (   str . match (  / \[ \] | \( \) /  )   )
        {
                // Replace occurrences of '[]' or '()' with an empty string.
                str    =    str . replace (  / \[ \] | \( \) / g  ,  ""  ) ;
        }

        // After processing, if the string is empty, it means brackets were balanced.
        // Otherwise, they were not. Print "yes" or "no" accordingly.
        console . log (  ( str    ==    "" )   ?   "yes"   :   "no"  ) ;
}
// End of script execution.