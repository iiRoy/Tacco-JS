'use strict'
// This script calculates the maximum possible Greatest Common Divisor (GCD)
// among all numbers in a given input array, where one number is optionally excluded
// from the GCD calculation for each iteration.

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 *
 * This function is defined as a constant arrow function.
 * It's a recursive implementation.
 *
 * @param   { number }   a   -   The   first   integer.
 * @param   { number }   b   -   The   second   integer.
 * @returns { number }   The   GCD   of   'a'   and   'b'.
 */
const    gcd    =    (   a,   b   )    =>    Boolean(   b   )   ?    gcd(   b,    a    %    b   )    :    a


/**
 * A utility arrow function to explicitly convert a value to a Number.
 * This ensures consistency when parsing string inputs.
 *
 * @param   { string }   num   -   The   value   to   be   converted   to   a   number.
 * @returns { number }   The   numeric   representation   of   the   input.
 */
const    convertNum    =    num    =>    Number(   num   )


/**
 * The main entry point of the program.
 * It processes the input to find the maximum GCD as described.
 *
 * The input is expected to be an array of strings, where:
 * -   The   first   element   (`input[0]`)   is   the   count   of   numbers.
 * -   The   second   element   (`input[1]`)   is   a   space-separated   string   of   numbers.
 *
 * @param   { string[] }   input   -   An   array   containing   the   program's   input.
 */
const    Main    =    input    =>    {

    // Extract the count of numbers from the first line of the input.
    const    count    =    Number(   input[   0   ]   )


    // Parse the space-separated numbers from the second line of the input.
    // The `split(' ')` method separates the string into an array of number strings,
    // and `map(convertNum)` converts each string to an actual number.
    const    nums    =    input[   1   ]   .   split(   ' '   )   .   map(   convertNum   )


    // Initialize a variable to store the maximum GCD found across all iterations.
    // It starts at 0, as GCDs are non-negative.
    let    result    =    0


    // Outer loop: This loop iterates 'count' times. In each iteration 'i',
    // we consider 'nums[i]' as the number that is *excluded* from the GCD calculation
    // for the current iteration.
    for    (    let    i    =    0    ;    i    <    count    ;    i++    )    {

            // Initialize 'tmpResult' for the current iteration's GCD calculation.
            // If 'i' is 0, we start with 'nums[1]' (to avoid using nums[0] if it's the excluded one).
            // Otherwise, we start with 'nums[0]' (as nums[i] is excluded).
            let    tmpResult    =    i    ===    0    ?    nums[   1   ]    :    nums[   0   ]


            // Inner loop: This loop iterates through all numbers in the 'nums' array.
            // It calculates the GCD of all numbers, *excluding* the one at index 'i'.
            for    (    let    n    =    0    ;    n    <    count    ;    n++    )    {

                    // Conditional check: Only include numbers in the GCD calculation
                    // if their index 'n' is not equal to the 'excluded' index 'i'.
                    if    (    i    !==    n    )    {

                            // Update 'tmpResult' by calculating the GCD of its current value
                            // and the number at 'nums[n]'.
                            tmpResult    =    gcd(   tmpResult,    nums[   n   ]   )

                    }

            }

            // After calculating 'tmpResult' for the current 'i' (with nums[i] excluded),
            // compare it with the overall 'result'. If 'tmpResult' is greater, update 'result'.
            result    =    result    <    tmpResult    ?    tmpResult    :    result

    }

    // Finally, print the maximum GCD found to the console.
    console.   log(   result   )

}


// This block handles reading input from standard input (/dev/stdin)
// and then passes the processed input to the Main function.
// It reads the entire file as UTF-8, trims leading/trailing whitespace,
// and splits the content into an array of lines based on newline characters.
Main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,    "utf8"   )   .   trim(   )   .   split(   /   \n   /   )   )