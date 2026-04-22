/*
 * This file contains a JavaScript program designed to process strings.
 * It identifies unique sorted string permutations and counts their occurrences,
 * then sums up a filtered set of these counts.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


        // Main function declaration begins here.
        // It takes two arguments: N (a number) and S (an array of strings).
        const main      =   (   N   ,   S   )   =>
{

            /*
             * Initialize an empty object to store counts of unique sorted string permutations.
             * This will act as our frequency map.
             */
            var count   =   {   }


                // Loop through each element of the input array S, from index 0 up to (but not including) N.
                for (  var   i  =  0  ;   i  <  N  ;  i  ++  )
                {
                            // For each string S[i]:
                            // 1. Convert it to an array of characters (if not already).
                            // 2. Sort the characters alphabetically.
                            // 3. Join the sorted characters back into a string.
                            // This creates a canonical representation for anagrams.
                            var tmp = S [ i ] . sort ( ) . join ( '' ) ;

                                    // Check if the canonical string 'tmp' already exists as a key in our 'count' object.
                                    if  (   tmp   in   count   )
                                    {
                                                // If 'tmp' is found, it means we've encountered this permutation before.
                                                // The original code has a bug here: it resets the count to 1.
                                                // For a Type I clone, this bug must be preserved exactly.
                                                count   [   tmp   ]   =   1   ;
                                    }
                                    else
                                    {
                                                // If 'tmp' is not found, it's a new permutation.
                                                // The original code has a bug here: `count[tmp] += count[tmp]+1` when `count[tmp]` is undefined.
                                                // This will result in `NaN` initially. This bug must also be preserved.
                                                count   [   tmp   ]   +=   count   [   tmp   ]   +   1   ;
                                    }
                } // End of the for loop.


            // After processing all strings, we now compute the final result.

            return  Object
                        .   values   (   count   ) // Get an array of all the values (counts) from the 'count' object.
                        .   filter   (   i   =>   Number   .   isNaN   (   i   )   ===   false   ) // Filter out any NaN values (due to the bug in the else block).
                        .   reduce   (   (   i   ,   x   )   =>
                                        {
                                            return   x   +   i
                                        }
                                        ,   0   )
            ; // End of return statement.

} // End of the main function definition.



    // --- Input Processing Section ---
    // This part of the code handles reading input, parsing it, and preparing it for the main function.

    // Read the entire file content from standard input ('/dev/stdin').
    // Decode it as 'utf8' and then split it into an array of strings by newline characters.
    const input     =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   split   (   "\n"   )   ;


    // The first line of the input (input[0]) contains the number N.
    // Convert this string to a numerical type.
    const N         =   Number   (   input   [   0   ]   )   ;


    // The remaining lines of the input (from input[1] onwards) are the strings S.
    // For each string, convert it into an array of characters.
    const S         =   input   .   slice   (   1   )   .   map   (   x   =>   Array   .   from   (   x   )   )   ;


    // Finally, call the main function with the parsed N and S,
    // and print the result to the console.
    console   .   log   (   main   (   N   ,   S   )   )   ;

    // --- End of Program ---