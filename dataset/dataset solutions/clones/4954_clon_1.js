/*
 *  This JavaScript program processes a given input string.
 *  The 'input' parameter is expected to contain all raw data.
 */

function   Main   (   input   )
{

    // Declare multiple variables required for the program's logic.
    var   N,   r,   c,   rabbits;



    // Split the input string by newline characters.
    // The first part goes into N, the second into r.
    [   N,   r   ]   =   input.split   (   "\n"   )   ;


    // Further process the 'r' string: split by space, then map to integers.
    rabbits   =   r.split   (   " "   )   .map   (   i   =>   parseInt   (   i   )   )   ;


    // Initialize a counter variable 'c' to zero.
    c   =   0   ;


    // Iterate through the 'rabbits' array using forEach.
    // For each element, check a specific condition and increment 'c' if true.
    rabbits.forEach   (   (   r,   i,   s   )   =>   c   +=   s   [   r   -   1   ]   ===   i   +   1   ?   1   :   0   )   ;


    // Output the final calculated value, which is 'c' divided by 2.
    console.log   (   c   /   2   )   ;

}


// *** DO NOT EDIT THE FOLLOWING LINES ***
// These lines handle reading input from stdin and invoking the Main function.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;