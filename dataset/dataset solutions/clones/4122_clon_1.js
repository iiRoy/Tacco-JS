/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * - No changes to identifiers, variable names, function names, operators, or expressions.
 * - Only whitespace and comments have been altered.
 * The goal is to make the code look visually different while maintaining
 * identical logical and structural integrity.
 */

( ( input ) => { // Start of an Immediately Invoked Function Expression (IIFE)

    // Split the input string into an array of lines.
    const   lines   =   input . split ( "\n" ) ;

    // Parse the first line to get the value of N.
    // The bitwise OR with 0 ( | 0 ) is a common way to convert to integer.
    const   N   =   lines [ 0 ]   |   0 ;


    /*
     * Process the remaining lines to extract three arrays: C, S, and F.
     * lines.slice(1) gets all lines except the first one.
     * .map(l => l.split(" ").map(x => x|0)) parses each line into an array of integers.
     * .reduce(...) then transforms this array of arrays into three separate arrays (C, S, F)
     * where C[i], S[i], F[i] correspond to the i-th element from each line.
     */
    const   [ C ,   S ,   F ]   =   lines . slice ( 1 )
                                        . map ( l   =>   l . split ( " " ) . map ( x   =>   x   |   0 ) )
                                        . reduce ( ( accumulator ,   line )   =>
                                            accumulator . map ( ( e ,   i )   =>   e . concat ( line [ i ] ) ) ,
                                            [ [ ] ,   [ ] ,   [ ] ]
                                        ) ;


    // Define the 'solver' function, which calculates a specific value for a given index 'i'.
    const   solver   =   i   =>   {

        // Base case: If 'i' is the last index (N - 1), the result is 0.
        if   (   i   ===   N   -   1   )
        {
            return   0 ;
        }

        // Initialize 'current' index and 't' (time) variable.
        let   current   =   i ;
        let   t   =   0 ;

        // Loop until 'current' reaches the last index.
        while   (   current   !==   N   -   1   )
        {
            /*
             * This is the core calculation logic.
             * It updates 't' based on C[current], S[current], and F[current].
             * Math.max(S[current] - t, ...) calculates the waiting time before departure.
             * The ternary operator (t % F[current] !== 0 ? ...) calculates additional waiting time
             * to align with the frequency F[current].
             */
            t   +=   Math . max (   S [ current ]   -   t ,
                                    t   %   F [ current ]   !==   0   ?
                                        F [ current ]   -   t   %   F [ current ]   :
                                        0
                                )   +   C [ current ] ;

            // Move to the next station.
            current ++ ;
        }

        // Return the final calculated time 't'.
        return   t ;
    } ; // End of the 'solver' function definition.


    /*
     * Generate an array of numbers from 0 to N-1.
     * Apply the 'solver' function to each number.
     * For each result, print it to the console.
     */
    Array . from (   new   Array ( N ) ,   ( _ ,   k )   =>   k   )
          . map ( solver )
          . forEach ( x   =>   console . log ( x ) ) ;

} ) (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ; // End of IIFE invocation, passing file content as input.

// This line was commented out in the original and remains so.
// ) ( ` ` ) ;