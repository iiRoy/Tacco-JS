/*
 * This JavaScript module processes a specific type of textual input.
 * It demonstrates a Type I code clone, preserving all functional aspects
 * while extensively modifying whitespace and comments for visual distinction.
 */

function   Main   (   impu   )
{
    // Initialize 'imput' by splitting the raw input string 'impu' by newline characters.
    let   imput    =    impu  .  split   (   "\n"   )   ;


    /*
     * The 'name' variable holds the first part of the first line of input,
     * after splitting it by spaces.
     */
    let   name     =    imput [ 0 ]  .  split   (   " "   )   ;


    // The 'count' variable stores the numeric values from the second line of input.
    let   count    =    imput [ 1 ]  .  split   (   " "   )   ;


    // --- Type Conversion Section ---
    // Ensure that the elements of 'count' are treated as integers for arithmetic operations.
    count [ 0 ]    =    parseInt   (   count [ 0 ]   )   ;
    count [ 1 ]    =    parseInt   (   count [ 1 ]   )   ;


    /*
     * Conditional logic:
     *   If the first element of 'name' matches the third line of input,
     *   decrement the first count. Otherwise, decrement the second count.
     */
    if   (   name [ 0 ]   ===   imput [ 2 ]   )
    {
        count [ 0 ] --   ;   // Decrement the first counter.
    }
    else
    {
        count [ 1 ] --   ;   /*
                               * Decrement the second counter.
                               * This branch executes if the condition in 'if' is false.
                               */
    }


    // Output the final modified counts to the console, separated by a single space.
    console .   log   (   count [ 0 ]   +   " "   +   count [ 1 ]   )   ;
} // End of the Main function definition.


// The program's entry point: calling Main with input from standard input.
Main   (
    require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
)   ;