/* This file contains a JavaScript solution to a problem.
   The main logic is encapsulated in the 'main' function.
   Original source: See problem description.
   This version is a Type I clone, meaning only whitespace and
   comments have been altered for visual distinction. */

    function   main (   input  =  ""   ) {

        // Split the entire input string into individual lines based on newline characters.
        const   lines   =   input .   split   (   "\n"   ) ;

        // Parse the second element of the first line (after splitting by space) as an integer.
        const   _K    =   0   |   lines [   0   ] .   split   (   " "   ) [   1   ] ;

        // Split the second line by space, then map each part to an integer.
        const   arr   =   lines [   1   ] .   split   (   " "   ) .   map   (   (   v   )   =>   0   |   v   ) ;


        let   l   =   1   ;   // Initialize the lower bound for binary search.
        let   r   =   arr .   reduce   (   (   a ,   b   )   =>   {   return   Math .   max   (   a ,   b   )   }   ) ;   // Initialize the upper bound as the maximum value in the array.
        let   mid   =   0   |   (   r   +   l   )   *   0.5   ;   // Calculate the initial midpoint.
        let   res   =   r   ;   // Initialize the result with the upper bound.

        // Perform a binary search.
        while   (   l   <=   r   )   {

            let   k   =   0   ;   // Counter for the number of cuts.

            // Iterate over each value in the array to calculate 'k'.
            arr .   forEach   (   (   v   )   =>   {

                let   d   =   0   |   v   /   mid   ;   // Calculate the number of full segments.
                if   (   v   ===   d   *   mid   )   {
                    d --   ;   // If 'v' is a perfect multiple, one less cut is needed.
                }
                k   +=   d   ;   // Accumulate the cuts.
            }   )


            // Decide whether to narrow the search range.
            if   (   k   <=   _K   )   {
                res   =   mid   ;   // Current mid is a possible answer, try smaller.
                r   =   mid   -   1   ;   // Move upper bound down.
            }   else   {
                l   =   mid   +   1   ;   // Not enough cuts, need larger segments, move lower bound up.
            }
            mid   =   0   |   (   r   +   l   )   *   0.5   ;   // Recalculate midpoint.
        }
        return   res   ;   // Return the final result.
    }


/* *************************************************************************
   * Module exports and main execution block.
   * This section handles how the main function is exposed and executed.
   ************************************************************************* */
    exports .   main   =   main   ;

    function   Main   (   input   )   {
        // Trim whitespace from input and pass to the core logic, then print result.
        console .   log   (   main   (   input .   trim   (   )   )   ) ;
    }

    // Check if the script is not being run in a "test" environment.
    if   (   process .   argv [   2   ]   !==   "test"   )   {
        // If not a test, read input from stdin and execute Main.
        Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin" ,   "utf8"   )   ) ;
    }