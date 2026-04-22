const    main   =   (   input   )    =>
{
    /*
     * This block is responsible for parsing the input string.
     * It expects two space-separated integers, N and K.
     */
    const   [   N   ,   K   ]   =   input
        .trim()
        .split(' ')
        .map(   x   =>   parseInt(   x   )   )
    ;

    // Initialize a variable to accumulate the result.
    let   count   =   0
    ;

    // Begin a loop that iterates N times.
    for   (   let   i   =   0   ;   i   <   N   ;   i++   )
    {
        // Check if this is the very first iteration of the loop.
        if   (   i   ===   0   )
        {
            // If it's the first iteration, add K to the count.
            count   +=   K
            ;
            // Then, immediately proceed to the next iteration.
            continue
            ;
        }
        // For all subsequent iterations (i > 0), perform a multiplication.
        // The count is multiplied by (K - 1).
        count   *=   (   K   -   1   )
        ;
    }


    // After the loop completes, print the final calculated count to the console.
    console
        .log(   count   )
    ;
}

/*
 * This part of the script handles the execution flow.
 * It reads the standard input and passes it to the main function.
 * This is a common pattern for competitive programming in Node.js.
 */
main
(
    require("fs")
        .readFileSync
        (
            "/dev/stdin",
            "utf8"
        )
)
;