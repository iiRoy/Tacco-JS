/*
 * This JavaScript file implements a solution to a specific string matching problem.
 * The primary goal is to determine if a given string can be reduced to "keyence"
 * by removing a contiguous prefix and a contiguous suffix.
 */

"use strict" ; // Enforces strict mode for cleaner code and better error handling.

// This is the main entry point function for the program.
// It takes the entire input as a single string.
function   main (   input   )   {

    // First, we parse the input. The problem typically provides input
    // with each piece of data on a new line.
    var   lines   =   input .   split (   '\n'   )   ;

    // The actual string we need to analyze is usually on the first line.
    var   str   =   lines [   0   ]   ;

    // We store the length of the string for use in our loops,
    // avoiding recalculation inside the loops for slight optimization.
    var   length   =   str .   length   ;


    /*
     * We will iterate through all possible combinations of removing a prefix and a suffix.
     * 'start' denotes the index where the prefix removal ends (exclusive).
     * 'end' denotes the index where the suffix removal begins (inclusive).
     */
    for   (   var   start   =   0   ;   start   <   length   ;   start ++   )   { // Outer loop: controls the length of the prefix to keep.

        // Inner loop: controls the length of the suffix to keep.
        // 'end' starts from 'start' because the removed prefix and suffix can overlap,
        // or the prefix can be empty, or the suffix can be empty.
        for   (   var   end   =   start   ;   end   <=   length   ;   end ++   )   {

            // Construct the new string 's' by concatenating the prefix and the suffix.
            // str.slice(0, start) extracts the characters from index 0 up to (but not including) 'start'.
            // str.slice(end) extracts characters from 'end' to the end of the original string.
            var   s   =   str .   slice (   0   ,   start   )   +   str .   slice (   end   )   ;


            // Now, we check if the resulting string 's' is exactly "keyence".
            if   (   s   ===   'keyence'   )   {

                // If it matches, we print "YES" to the console.
                console .   log (   'YES'   )   ;

                // Since we found a valid combination, we can immediately exit the function.
                // No need to check further combinations.
                return   ;
            }
        }
    }

    // If the program reaches this point, it means no combination of prefix and suffix removal
    // resulted in "keyence".
    // Therefore, we print "NO".
    console .   log (   'NO'   )   ;
}


// This line is responsible for executing the main function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// and passes it as the 'input' argument to the 'main' function.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;


// This is a utility function, often included in competitive programming templates,
// but not directly used in the specific logic of this problem's 'main' function.
// It's designed to split a line of space-separated numbers and convert them to integers.
function   splitNum (   line   )   {

    // Splits the input 'line' by one or more whitespace characters.
    // Then, it maps each resulting string part to its integer representation.
    return   line .   split (   /\s+/   ) .   map (   function   (   n   )   {

        // Converts the string 'n' (which is expected to be a number) into an integer.
        return   parseInt (   n   )   ;
    }   )   ;
}
// End of file.