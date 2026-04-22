// This script processes a string and an integer from standard input.
// It aims to find the first non-'1' character within a specific range.

"use strict" // Activate strict mode for better error handling and cleaner code.


// The primary function to handle the program's logic.
function   main (   input   )
{
    // First, split the entire input string by newline characters
    // to get an array of individual lines.
    input  =  input . split (   '\n'   )  ;

    // The first line of input is assigned to constant S.
    const   S   =   input[0]  ;

    // The second line of input is parsed as an integer (base 10)
    // and assigned to constant K.
    const   K   =   parseInt (   input[1]   ,   10   )  ;


    // Perform a search within string S for the first occurrence of
    // any character that is NOT '1'. The regular expression /[^1]+/
    // matches one or more characters that are not '1'.
    // The 'search' method returns the index of the first match, or -1 if no match is found.
    let   res   =   S . search (   /[^1]+/   )  ;

    // Now, evaluate the result of the search.
    // If 'res' is a valid index (0 or greater) AND it's within the
    // range specified by K (i.e., less than K), then proceed.
    if  (   res   >=   0   &&   res   <=   K   -   1   )
    {
        // If the condition is met, print the character from string S
        // at the found index 'res'.
        console . log (   S[res]   )  ;
    }
    // If the condition in the 'if' statement is not met:
    else
    {
        // This means either no non-'1' character was found (res is -1),
        // or the first non-'1' character was found at an index
        // greater than or equal to K. In either case, print '1'.
        console . log (   1   )  ;
    }
} // End of the main function.


// This is the entry point for executing the program.
// It reads the entire content of standard input,
// converts it to a UTF-8 string, and then passes it
// as an argument to the 'main' function.
main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )  ;