'use strict' ; // This directive enables strict mode for the entire script.

// A utility function 'p' for printing output to the console.
// It simply wraps console.log for convenience and brevity.
const   p   =   s   =>  console.log(   s   ) ;


/*
 * The main function that processes the input data.
 * It takes the entire input string as an argument.
 */
function    Main  (   input   )
{

    // Split the input string into an array of lines.
    // Each line from the input will become an element in the 'input' array.
    input   =   input.split (   "\n"   ) ;

    // Parse the first number from the first line of input.
    // This value, 'N', likely represents a count or size.
    let     N   =   input [   0   ] . split (   " "   ) [   0   ] ;

    // Parse the second line of input into an array 'A'.
    // This array 'A' probably contains a sequence of items or indices.
    let     A   =   input [   1   ] . split (   " "   ) ;

    // Initialize a new Map object.
    // This 'map' will be used to store frequencies or counts.
    let     map     =   new Map (   ) ;


    // Initialize counts for elements from 1 to N in the map.
    // Each element's count is set to 0 initially.
    for (   let     i   =   0   ;   i   <   N   ;   i ++   )
    {
        map [   i   +   1   ]   =   0   ;
    }


    // Iterate through array 'A' and increment counts in the map.
    // This loop effectively calculates the frequency of each element in 'A'.
    for (   let     i   =   0   ;   i   <   A.length   ;   i ++   )
    {
        map [   A [   i   ]   ] ++   ;
    }


    // Iterate from 0 to N-1 and print the final counts.
    // For each 'i', it prints the count associated with 'i + 1' from the map.
    for (   let     i   =   0   ;   i   <   N   ;   i ++   )
    {
        p (   map [   i   +   1   ]   ) ;
    }

} // End of Main function definition.


// *********************************************************************************************
// The following line handles standard input/output operations.
// It reads the entire content from standard input and passes it to the Main function.
// DO NOT MODIFY THE CODE BELOW THIS LINE, as it is part of the execution environment setup.
// *********************************************************************************************
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;