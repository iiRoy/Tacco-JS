/*
 * This file contains a JavaScript program that calculates a specific value
 * based on an input number. It demonstrates a simple loop and conditional logic.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

'use strict' // Enforces strict mode for cleaner code and fewer errors.


const Main =   ( input   )   =>
{
        // Parse the input string into an integer N.
        const N =   parseInt(   input.trim()   )


        let result   =   ':('   // Initialize result with a default "not found" string.


        // Loop from 1 up to N to find the desired value.
        for (   let i   =   1;   i   <=   N;   i++   )
        {
                // Calculate a temporary value based on the current loop variable 'i'.
                const tmp   =   Math.floor(   i   *   1.08   )

                // Check if the temporary value matches N.
                if   (   tmp   ===   N   )
                {
                        result   =   i   // If it matches, update the result and potentially break (though not explicitly done here).
                }
        }


        console.log(   result   ) // Output the final result to the console.

        return   result // Return the result (useful for testing or further processing).
}


// Read input from stdin and pass it to the Main function.
Main(   require(   'fs'   ).readFileSync(   '/dev/stdin',   'utf8'   )   )