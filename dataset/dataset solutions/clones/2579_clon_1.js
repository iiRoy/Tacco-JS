/*
 * This file contains the solution for a specific problem.
 * It processes input data to compute a sum based on certain rules.
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function   Main   (   input   )   {
    // Enable strict mode for better error handling and cleaner code.
    "use strict"   ;


    // Split the entire input string by newline characters to get an array of lines.
    const   temp   =   input   .   split   (   "\n"   )   ;

    /*
     * Parse the first element of the 'temp' array as an integer.
     * This usually represents the number of elements or some other configuration.
     */
    const   n   =   parseInt   (   temp   .   shift   (   )   )   ;

    // Process the next line: split by space, then map each element to an integer.
    const   bn   =   temp   .   shift   (   )   .   split   (   " "   )   .   map   (   e   =>   parseInt   (   e   )   )   ;

    let   an   =   [   bn   [   0   ]   ]   ;   // Initialize 'an' with the first element of 'bn'.

    // Iterate over each element 'x' in the 'bn' array.
    bn   .   forEach   (   x   =>   {
        // Get the last element from 'an' and remove it.
        const   last   =   an   .   pop   (   )   ;

        // Apply specific logic based on the comparison of 'last' and 'x'.
        if   (   last   >   x   )   {
            an   .   push   (   x   )   ;    // Push 'x' twice if 'last' is greater.
            an   .   push   (   x   )   ;
        }   else   {
            an   .   push   (   last   )   ; // Otherwise, push 'last' then 'x'.
            an   .   push   (   x   )   ;
        }
    }   )   ;

    // Calculate the sum of all elements in the 'an' array using reduce.
    let   sumOfBn   =   an   .   reduce   (   (   acc   ,   cur   )   =>   acc   +   cur   )   ;

    // Output the final calculated sum to the console.
    console   .   log   (   sumOfBn   )   ;
}

/*
 * The following section handles standard input/output operations.
 * It reads the entire content from stdin and passes it to the Main function.
 * DO NOT MODIFY THIS PART.
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;