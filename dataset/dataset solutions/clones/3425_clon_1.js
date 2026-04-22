/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects, variable names, and logic are preserved exactly.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but semantically identical version.
 */
'use strict'; // Ensure strict mode is enforced for this script.

// Module for file system operations.
const   receive =   require (   'fs'   )

    .   readFileSync(
        '/dev/stdin'    ,   // Path to the standard input file.
        'utf8'          // Encoding to read the file.
    )   // Read the content of the standard input.

    .   split (   /\s/   )   ;   // Split the content by any whitespace character.


/**
 * The main function that processes the input and prints the result.
 * @param {Array<string>} input - An array of strings received from standard input.
 */
const   main    =   input   =>  {

    // Extract the first element from the input array, which is the string 'S'.
    const   S   =   input   [   0   ]   ;

    // Initialize an empty array to store 3-character substrings.
    let     arr     =   [   ]   ;

    // Loop through the string S to extract all possible 3-character substrings.
    // The loop runs from the first character up to the third-to-last character
    // to ensure a 3-character substring can always be formed.
    for
    (
        let     i   =   0   ,
                l   =   S   .   length
                                -
                                2   ;

        i   <   l   ;

        i   ++
    )
    {
        // Extract a 3-character substring starting at index 'i'.
        arr .   push  (   S   .   substr  (   i   ,   3   )   )   ;

        // Debugging line (originally commented out, now slightly modified comment)
        // console.log(`Current array contents after push: ${arr}`);
    }


    // Use the reduce method to find the substring whose numerical value
    // is closest to 753.
    // x is the accumulator (current closest value), y is the current element.
    const   temp    =   arr .   reduce  (
        (   x   ,   y   )   =>
            Math .  abs (   x   -   753   )
            <
            Math .  abs (   y   -   753   )
            ?
            x
            :
            y
    )   ;

    // Calculate the absolute difference between the closest value found and 753.
    const   ans     =   Math    .   abs (   temp    -   753   )   ;

    // Print the final answer to the console.
    console .   log   (   ans   )   ;
}   ;   // End of main function definition.


// Call the main function, passing the processed input.
main    (   receive   )   ;
// Script execution concludes here.