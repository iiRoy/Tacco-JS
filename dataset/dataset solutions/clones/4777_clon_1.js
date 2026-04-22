// This JavaScript file contains a program designed to find the number of combinations (x, y, z)
// such that their sum equals a target value S, given an upper bound K for each variable.
// All variables x, y, and z must be non-negative integers not exceeding K.

'use     strict'
// The main function serves as the entry point for processing the problem's logic.
const   main    =   (   input   )   =>  {

    // Parse the first numeric value from the input string. This represents the upper limit 'K'.
    const   K   =   parseInt    (   input   .   split   (   ' '   )   [   0   ]   )
    // Parse the second numeric value from the input string. This represents the target sum 'S'.
    const   S   =   parseInt    (   input   .   split   (   ' '   )   [   1   ]   )


    // Initialize a variable to count the valid combinations.
    let     sum     =   0

    // Start of the first nested loop for variable 'x'.
    // 'x' iterates from 0 up to 'K', inclusive.
    for (   let     x   =   0   ;   x   <=  K   ;   x   ++  )   {
        // Start of the second nested loop for variable 'y'.
        // 'y' iterates from 0 up to 'K', inclusive.
        for (   let     y   =   0   ;   y   <=  K   ;   y   ++  )   {
            // Start of the third nested loop for variable 'z'.
            // 'z' iterates from 0 up to 'K', inclusive.
            for (   let     z   =   0   ;   z   <=  K   ;   z   ++  )   {
                // Check if the current combination (x, y, z) adds up to the target sum 'S'.
                if  (   x   +   y   +   z   === S   )   {
                    // If the condition is met, increment the counter.
                    sum ++
                }
            }   // End of the inner 'z' loop.
        }   // End of the middle 'y' loop.
    }   // End of the outer 'x' loop.

    // Print the final count of valid combinations to the console.
    console .   log (   sum )
}

// Invoke the main function, providing it with input read from standard input.
// This typically involves reading a file at '/dev/stdin' on Unix-like systems,
// and decoding it using 'utf-8' character encoding.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf-8' )   )