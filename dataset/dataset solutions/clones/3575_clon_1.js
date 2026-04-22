/* This is a JavaScript file implementing a solution to a specific problem.
 * It strictly adheres to modern JavaScript practices.
 */
"use strict" ; // Enforce strict mode for cleaner code.


/**
 * The main function that processes the input and produces the output.
 * @param {string} input - The raw input string from stdin.
 */
function   Main (  input  )
{
    // Split the entire input string by newline characters to get an array of lines.
    input   =   input . split (  "\n"  ) ;


    // The first line contains N and K, separated by a space.
    let   line0   =   input [ 0 ] . split (  " "  ) ;

    // Parse N as an integer from the first part of line0.
    let   N   =   parseInt (  line0 [ 0 ]  ) ;
    // Parse K as an integer from the second part of line0.
    let   K   =   parseInt (  line0 [ 1 ]  ) ;


    /**
     * Helper function to calculate the cube of a number.
     * @param {number} k - The number to be cubed.
     * @returns {number} The cube of k.
     */
    function   pow3 (  k  )
    {
        // Calculate k * k * k
        return   k  *  k  *  k ;
    }


    // Check if K is an even number.
    if  (  K  %  2   ===   0  )
    {
        // If K is even, calculate the sum of two cubic terms.
        // The first term: (N / K) floored, cubed.
        // The second term: ((N + K / 2) / K) floored, cubed.
        console . log (  pow3 (  Math . floor (  N  /  K  )  )   +   pow3 (  Math . floor (  (  N  +  K  /  2  )  /  K  )  )  ) ;
    }
    else
    {
        // If K is odd, only the first cubic term is considered.
        // The term: (N / K) floored, cubed.
        console . log (  pow3 (  Math . floor (  N  /  K  )  )  ) ;
    }
}


// --- Program Entry Point ---
// Read the entire content of stdin as a UTF-8 string
// and pass it to the Main function for processing.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin" ,   "utf8"  )  ) ;