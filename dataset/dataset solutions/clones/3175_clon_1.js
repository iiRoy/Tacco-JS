// This function calculates the minimum "magic point" cost.
// It's a recursive function that explores different combinations.
function    calc_mp (    depth   ,   N   ,   ABC   ,   abc   ,   ls    )    {


    // Base case: if the current depth reaches N, we've processed all items.
    if   (   depth   ==   N   )   {
        /*
         * Check if all elements in 'abc' are positive.
         * This condition is crucial for a valid state.
         */
        if    (   Math.min   (   ...abc   )   >   0   )    {

            // Calculate the magic point (mp) difference.
            // A fixed penalty of -30 is applied.
            const    mp    =    Math.abs   (   ABC[0]   -   abc[0]   )   +   Math.abs   (   ABC[1]   -   abc[1]   )   +   Math.abs   (   ABC[2]   -   abc[2]   )   -   30    ;
            return    mp    ; // Return the calculated magic point.

        }    else    {

            // If any element in 'abc' is not positive, it's an invalid state.
            // Return a very large number to signify an impossible or very costly path.
            const    m    =    1000   *   1000    ;
            return    m   *   m   *   m    ;

        }
    }


    // Recursive step: explore four different possibilities for the current depth.

    // Option 0: Do not use the current item (ls[depth]) for any of ABC.
    const    ret0    =    calc_mp   (   depth   +   1   ,   N   ,   ABC   ,   abc   ,   ls   )    ;

    // Option 1: Add ls[depth] to abc[0]. A cost of +10 is incurred.
    var    ret1    =    calc_mp   (   depth   +   1   ,   N   ,   ABC   ,   [   abc[0]   +   ls[depth]   ,   abc[1]   ,   abc[2]   ]   ,   ls   )   +   10    ;

    // Option 2: Add ls[depth] to abc[1]. A cost of +10 is incurred.
    var    ret2    =    calc_mp   (   depth   +   1   ,   N   ,   ABC   ,   [   abc[0]   ,   abc[1]   +   ls[depth]   ,   abc[2]   ]   ,   ls   )   +   10    ;

    // Option 3: Add ls[depth] to abc[2]. A cost of +10 is incurred.
    var    ret3    =    calc_mp   (   depth   +   1   ,   N   ,   ABC   ,   [   abc[0]   ,   abc[1]   ,   abc[2]   +   ls[depth]   ]   ,   ls   )   +   10    ;


    // Return the minimum cost among all explored options.
    return    Math.min   (   ret0   ,   ret1   ,   ret2   ,   ret3   )    ;
}


/*
 * This is the main entry point function.
 * It processes the input and initiates the calculation.
 */
function    main (    input    )    {

    // Split the input string into individual lines.
    const    lines    =    input .   split   (   '\n'   )    ;


    // Parse the first line to extract N, A, B, C.
    // N is the first element.
    const    N    =    lines[0]   .   split   (   ' '   )   .   map   (   x   =>   parseInt   (   x   )   )   [0]    ;
    // A is the second element.
    const    A    =    lines[0]   .   split   (   ' '   )   .   map   (   x   =>   parseInt   (   x   )   )   [1]    ;
    // B is the third element.
    const    B    =    lines[0]   .   split   (   ' '   )   .   map   (   x   =>   parseInt   (   x   )   )   [2]    ;
    // C is the fourth element.
    const    C    =    lines[0]   .   split   (   ' '   )   .   map   (   x   =>   parseInt   (   x   )   )   [3]    ;

    // Parse all lines to get the 'Ls' array.
    // Note: the first line (containing N, A, B, C) will also be parsed here,
    // but then removed by the shift() operation.
    var    Ls    =    lines   .   map   (   x   =>   parseInt   (   x   )   )    ;


    // Remove the first element from Ls, as it contains N, A, B, C,
    // and the subsequent elements are the actual 'L' values.
    Ls   .   shift   (   )    ;


    // Call the recursive calculation function with initial parameters.
    // depth starts at 0, N is the total count.
    // Target values are [A, B, C]. Current accumulated values start at [0, 0, 0].
    // Ls is the array of available lengths.
    const    result    =    calc_mp   (   0   ,   N   ,   [   A   ,   B   ,   C   ]   ,   [   0   ,   0   ,   0   ]   ,   Ls   )    ;

    // Output the final calculated result to the console.
    console   .   log   (   result   )    ;
}

// Execute the main function, reading input from standard input.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )    ;