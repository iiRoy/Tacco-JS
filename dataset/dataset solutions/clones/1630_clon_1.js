/*
 * This JavaScript file implements a solution to a problem involving
 * character manipulation and counting within a string.
 *
 * It processes an input string, analyzes its character composition,
 * and performs a series of operations to determine a specific minimum value.
 *
 * The algorithm involves counting occurrences of specific characters
 * and then strategically swapping them to achieve a desired state,
 * while tracking the number of swaps.
 *
 * This code is designed for a competitive programming context or similar
 * where input is read from stdin and output is written to stdout.
 */

    const   main   =   (   input   )   =>   {
        // The input string is first trimmed to remove any leading/trailing whitespace.
        // It is then split by newline characters.
        // The destructuring assignment `[, s]` extracts the second element
        // of the resulting array into the variable `s`, effectively ignoring the first.
        const   [   ,   s   ]   =   input   .   trim   (   )   .   split   (   '\n'   )   ;

        // The string `s` is converted into an array of individual characters.
        // This facilitates character-by-character processing and modification.
        const   str   =   Array   .   from   (   s   )   ;


        // Initialize several counters that will be used throughout the algorithm.
        let   wh   =   0   ;       // Counter for 'W' (White) characters.
        let   rd   =   0   ;       // Counter for 'R' (Red) characters.
        let   change   =   0   ;   // Counter for the total number of swaps performed.


        // `lastRed` is initialized to point to the last index of the character array.
        // This pointer will be used to track potential positions for 'R' characters
        // from the right end of the array.
        let   lastRed   =   str   .   length   -   1   ;


        // First pass: Iterate through each character in the `str` array
        // to count the total occurrences of 'W' and 'R' characters.
        // This uses a for...of loop for convenience.
        for   (   let   v   of   str   )   {
            // A ternary operator efficiently increments `wh` if the character is 'W',
            // otherwise it increments `rd`.
            v   ===   'W'   ?   wh   ++   :   rd   ++   ;
        }


        // Second pass: Iterate from the beginning of the array up to `lastRed`.
        // The purpose of this loop is to identify 'W' characters that are
        // in a position where they should ideally be 'R's (i.e., 'W's before 'R's).
        for   (   let   i   =   0   ;   i   <   lastRed   ;   i   ++   )   {
            // Check if the character at the current index `i` is a 'W'.
            if   (   str   [   i   ]   ===   'W'   )   {
                // If a 'W' is found, we need to find an 'R' from the right end to swap with it.
                // This inner `while` loop moves `lastRed` pointer to the left,
                // skipping over any 'W' characters encountered from the right.
                while   (   str   [   lastRed   ]   ===   'W'   )   {
                    lastRed   --   ;
                }

                // After potentially moving `lastRed`, check if the left pointer `i`
                // has met or surpassed the right pointer `lastRed`.
                // If `i >= lastRed`, it means there are no more 'R' characters
                // to swap with from the right, or all necessary swaps have been made.
                if   (   i   >=   lastRed   )   {
                    break   ;   // Exit the outer loop.
                }


                // Perform the swap operation using array destructuring assignment.
                // The 'W' at `str[i]` is replaced by 'R', and the 'R' at `str[lastRed]`
                // is replaced by 'W'. This effectively moves an 'R' to the left
                // and a 'W' to the right.
                ;   [   str   [   i   ]   ,   str   [   lastRed   ]   ]   =   [   'R'   ,   'W'   ]   ;

                change   ++   ;   // Increment the counter for the number of swaps.
                lastRed   --   ;   // Move the `lastRed` pointer one step to the left,
                                  // as the character at this position has now been processed.
            }
        }
        
        // Finally, the result is computed by taking the minimum of three values:
        // 1. The total number of swaps (`change`).
        // 2. The total count of 'W' characters (`wh`).
        // 3. The total count of 'R' characters (`rd`).
        // This value is then printed to the console.
        return   console   .   log   (   Math   .   min   (   change   ,   Math   .   min   (   wh   ,   rd   )   )   )   ;
    }   ;

// This conditional statement determines how the program is executed.
// If the environment variable `process.env.MYTEST` is set (truthy),
// it calls a `test()` function, typically for automated testing.
// Otherwise, it reads input from standard input (`/dev/stdin`) using Node.js's
// file system module (`fs`), decodes it as 'utf8', and passes it to the `main` function.
process   .   env   .   MYTEST   ?   test   (   )   :   main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;