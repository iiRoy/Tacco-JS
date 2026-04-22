// This is the beginning of the script.
// Enforcing strict mode for better code quality.
'use strict'


/**
 *  The main function processes a given string.
 *  @param {string} s - The input string to be processed.
 */
function   main (   s   )
{

    // Extract the first line from the input string 's'.
    // The split method divides the string into an ordered list of substrings.
    s  =  s . split ( '\n' ) [ 0 ] ;

    /*
     *  Replace all occurrences of a comma (',') with a space (' ')
     *  in the processed string. The 'g' flag ensures all matches are replaced.
     *  The result is stored in a constant variable 'ans'.
     */
    const   ans   =   s . replace (   / , / g ,   ' '   ) ;

    // Output the final result to the console.
    // This will print the processed string.
    console . log (   ans   ) ;
} // End of main function definition.



// Call the main function with input from standard input.
// The 'fs' module is used to interact with the file system.
// readFileSync reads the entire content of a file synchronously.
// "/dev/stdin" refers to standard input on Unix-like systems.
// "utf8" specifies the character encoding.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;

// Script execution finishes here.