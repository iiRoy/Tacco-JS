/*
 * This file processes a string to determine if it meets specific criteria.
 * It's a Type I clone, meaning only whitespace and comments are altered.
 * No logical or structural changes have been made to the original source.
 */
'use strict' ; // Ensure strict mode for robust code execution


const   input   =   require ( 'fs' )
  . readFileSync ( '/dev/stdin' ,   'utf8' )
  . trim ( )
  . split ( '\n' ) ; // Read input from standard input, trim, and split by newlines

let   S   =   input [ 0 ] ; // The first line of input is our target string S

let   ans   =   "Yes" ; // Initialize the answer as "Yes" (optimistic assumption)


// Iterate through each character of the string S, using a 0-based index.
for ( let   i   =   0 ;   i   <   S . length ;   i ++ )
{
        // Check if the current index 'i' is odd.
        // In 0-based indexing, odd indices (1, 3, 5...) correspond to the second, fourth, sixth characters, etc.
        if ( i % 2 )
        {
                // This block handles characters at odd positions within the string.
                // According to the problem logic, the character 'R' is not allowed at odd positions.
                if ( S [ i ]   ==   "R" )
                {
                        ans   =   "No" ; // If 'R' is found at an odd position, the condition is not met.
                        break ; // No need to check further, we already know the answer is "No". Exit the loop.
                }
        }
        else
        {
                // This block handles characters at even positions within the string.
                // In 0-based indexing, even indices (0, 2, 4...) correspond to the first, third, fifth characters, etc.
                // According to the problem logic, the character 'L' is not allowed at even positions.
                if ( S [ i ]   ==   "L" )
                {
                        ans   =   "No" ; // If 'L' is found at an even position, the condition is not met.
                        break ; // Terminate the loop early as the answer is definitively "No".
                }
        }
} // End of the character iteration loop

// Output the final determined answer to the console.
// This will be "Yes" if all conditions were met, or "No" otherwise.
console . log ( ans ) ;