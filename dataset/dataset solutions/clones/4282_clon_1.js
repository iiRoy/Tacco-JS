// This file contains a JavaScript program designed to check for a specific substring within an input string.
// It processes data from standard input to determine if a particular pattern exists.

'use strict' /* Enforce strict mode for cleaner code and fewer errors. */


const main =   /* Define the main function, which serves as the entry point for our program logic. */   input   =>   {

    // Step 1: Parse the input.
    // The input string is first split by newline characters, creating an array of lines.
    // Then, each line is further split by space characters.
    const   args   =   input   .   split   (   '\n'   )   .   map   (   arg   =>   arg   .   split   (   ' '   )   )   ;


    // Step 2: Extract the primary string for analysis.
    // We assume the target string 'S' is the first element of the first parsed argument.
    const   S   =   args   [   0   ]   [   0   ]   ;


    // Step 3: Determine the length of the string 'S'.
    const   N   =   S   .   length   ;


    // Step 4: Initialize a boolean flag to store the result.
    // This flag will be set to 'true' if the desired pattern is found.
    let   ans   =   false   ;


    // Step 5: Iterate through the string 'S' to search for the specific pattern.
    // The loop checks all possible two-character substrings, stopping one character before the end.
    for   (   let   i   =   0   ;   i   <   N   -   1   ;   i   ++   )
    {
        // Inside the loop: Check if the current two-character slice matches 'AC'.
        if   /* Check for the target substring */   (   S   .   slice   (   i   ,   i   +   2   )   ===   'AC'   )
        {
            // If the substring 'AC' is found, update the answer flag.
            ans   =   true   ;
            // No 'break' statement here, as the problem might imply we need to scan the whole string,
            // or it simply doesn't matter if we find multiple 'AC's.
        }
    }


    // Step 6: Output the final result.
    // Based on the value of 'ans', print either 'Yes' or 'No' to the console.
    console   .   log   (   ans   ?   'Yes'   :   'No'   )   ;

}   ;   // End of the main function definition.


// Program execution starts here:
// Read the content of '/dev/stdin' (standard input) synchronously as a UTF-8 string.
// Then, pass this content to the 'main' function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// This concludes the JavaScript program.