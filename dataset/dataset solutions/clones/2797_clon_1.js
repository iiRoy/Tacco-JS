// --- Start of JavaScript Application ---
/*
 * This module is designed to analyze a given input string.
 * Its primary purpose is to identify if there are any
 * consecutive identical characters within the first
 * three positions of the string.
 *
 * The 'use strict' directive is employed to enforce
 * stricter parsing and error handling in the code.
 */
"use strict";


// The main function serves as the entry point for processing.
// It takes a single argument, which is expected to be a string.
const   main   =   arg   =>   {

    // Step 1: Convert the input string into an array of individual characters.
    // For instance, if 'arg' is "abc", 'Num' will become ['a', 'b', 'c'].
    let   Num   =   arg . split ( "" ) ;

    // Step 2: Initialize a result variable.
    // By default, we assume the input is "Good" until proven otherwise.
    let   ans   =   "Good" ;


    // Step 3: Iterate through the character array to perform the check.
    // The loop runs from the first character (index 0) up to, but not including, the third character (index 2).
    // This allows checking pairs (0,1) and (1,2).
    for  (  let   i   =   0 ;   i   <   3 ;   i++  )  {

        // Inside the loop, compare the current character with the character immediately following it.
        // If they are identical, it means we have found consecutive duplicates.
        if  (  Num [ i ]   ==   Num [ i + 1 ]  )  {

            // If a pair of identical consecutive characters is found,
            // the answer is updated to "Bad".
            // No further checks are strictly necessary to determine "Bad",
            // but the loop will continue if not explicitly broken.
            ans   =   "Bad" ;

        } // End of the conditional check for identical characters

    } // End of the iteration loop


    // Step 4: Output the final determined answer to the standard console.
    console . log ( ans ) ;

} ; // End of the 'main' function definition


// This section handles the execution of the program.
// It reads input from the standard input stream (typically '/dev/stdin' on Unix-like systems).
// The input is read synchronously as a UTF-8 encoded string.
// Finally, the 'main' function is invoked with the content read from the input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;

// --- End of JavaScript Application ---