/*
 * This file contains a JavaScript program.
 * It's designed to solve a specific algorithmic problem.
 * The strict mode is enabled for better error handling and performance.
 */
"use strict";

// Define the main function that takes an argument.
const   main    =   (   arg   )   =>      {

        // Process the input string: trim whitespace and split by newlines.
        const       input       =   arg . trim ( ) . split ( "\n" )    ;

        // Parse the first line of input as an integer 'n'.
        const       n           =   parseInt ( input [ 0 ] )   ;

        /*
         * Parse the second line of input:
         * Split by spaces, then map each string part to an integer.
         * This creates an array of numbers.
         */
        const       arr         =   input   [   1   ]   .   split   (   " "   )   .   map   (   n   =>      parseInt   (   n   )   )   ;

        /**
         * Recursive function to calculate the maximum possible value.
         * @param {number} i - The current index in the 'arr' array.
         * @param {Array<number>} dst - The remaining available destination indices.
         * @returns {number} The maximum calculated value for the current state.
         */
        function    cal     (   i   ,   dst   )   {

                // Base case: if no more elements to process, return 0.
                if      (   i   ===     -1   )   {
                        return      0   ;
                }

                // Initialize an array to store results for different choices.
                const       results     =   [   ]   ;

                // Iterate over each possible destination 'j' in 'dst'.
                for     (   const       j       of      dst   )   {

                        // Create a new 'dst' array excluding the current 'j'.
                        const       next_dst    =   dst . filter (   v   =>      v   !==     j   )   ;

                        // Calculate the absolute difference between 'i' and 'j'.
                        const       abs         =   i   >   j   ?   i   -   j   :   j   -   i   ;

                        // Calculate the value for the current choice.
                        // It's arr[i] multiplied by the absolute difference,
                        // plus the recursive call for the next step.
                        const       val         =   arr [ i ]   *   abs   +   cal (   i   -   1   ,   next_dst   )   ;

                        // Add the calculated value to the results array.
                        results     .   push    (   val   )   ;

                }

                // Return the maximum value found among all choices.
                return      Math    .   max     (   ...results   )   ;

        }

        // Call the 'cal' function with initial parameters and log the result.
        // n - 1 is the last index of the array.
        // [...Array(n).keys()] creates an array [0, 1, ..., n-1] for initial destinations.
        console     .   log     (   cal   (   n   -   1   ,   [   ...Array (   n   )   .   keys   (   )   ]   )   )   ;

}

// Execute the main function, reading input from standard input.
main    (   require (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
/* End of file */