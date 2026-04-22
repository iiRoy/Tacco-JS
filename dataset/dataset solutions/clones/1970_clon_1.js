/*
 * This is a Type I clone example.
 * The code's functionality is identical.
 * Only whitespace and comments have been altered.
 */
const    main    =   (   input   )   =>   {

        // Parse the input string into an array of numbers.
        const   args    =   input  .  split  (  ' '  )  .  map  (  v  =>  Number  (  v  )  )

        // Calculate 'n' based on the first argument.
        const   n   =   args   [   0   ]   +   1
        // Retrieve 'k' from the second argument.
        const   k   =   args   [   1   ]
        // Determine the maximum value for the loop.
        const   max   =   n   -   k   +   1

        // Initialize sum variable.
        let   sum   =   0

        /*
         * This loop calculates the sum based on the 'max' value.
         * It iterates from 0 up to (but not including) 'max'.
         */
        for   (   let   i   =   0   ;   i   <   max   ;   i   ++   )   {

                // Accumulate the sum.
                sum   +=   max   -   i
        }

        // Output the final sum modulo a large prime number.
        console   .   log   (   sum   %   (   10   **   9   +   7   )   )
}

/*
 * Call the main function with input read from standard input.
 * The input is read synchronously and decoded as UTF-8.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )