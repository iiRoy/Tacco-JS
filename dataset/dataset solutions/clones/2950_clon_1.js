/*
 * This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators,
 * and expressions remain completely unchanged.
 *
 * Extensive modifications have been made to whitespace (indentation,
 * spacing, blank lines) and comments (added, modified, removed)
 * to ensure a visually distinct appearance while maintaining
 * logical and structural identity.
 */

'use strict' // Enforce strict mode for cleaner code.

// Define the main function to process the input.
const   main    =   (   input   )   =>  {

    // Trim leading/trailing whitespace and split the input by newline characters.
    const   args    =   input . trim ( ) . split ( '\n' )

    // Parse the second part of the first line as an integer for 'k'.
    // The first line is expected to be like "N K", we need K.
    const   k   =   parseInt (   args [   0   ] . split (   ' '   ) [   1   ] ,   10   )

    // The second line of the input is the string 's'.
    const   s   =   args [   1   ]


    // Construct the output string:
    // 1. Slice from the beginning up to k-1.
    // 2. Take the character at index k-1, convert it to lowercase.
    // 3. Slice from index k to the end of the string.
    // Then, log the combined string to the console.
    console . log (   ` ${   s . slice (   0 ,   k   -   1   )   } ${   s . slice (   k   -   1 ,   k   ) . toLowerCase (   )   } ${   s . slice (   k   )   } `   )

}   ;   // End of main function definition.


// Read input synchronously from standard input and pass it to the main function.
// This part handles file system operations.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   )   ;   // Call the main function with the input.