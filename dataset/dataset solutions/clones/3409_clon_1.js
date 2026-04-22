// This JavaScript code processes a list of numbers from standard input.
// It calculates a specific sum where the first occurrence of the maximum number
// in the list is treated differently.


const   fs   =    require   (   'fs'   )   ;   //  Import the 'fs' (File System) module, which is part of Node.js core.


/**
 *  The main entry point for processing the input data.
 *  This function expects an array of strings, typically read from a file or standard input.
 *
 *  @param   {string[]}   input   -   An array where each element is a line from the input.
 *                                   The first line is assumed to be metadata and is skipped.
 */
const    main    =    (   input   )    =>    {

    //  Extract the numeric data from the input.
    //  The first element (index 0) of the input array is discarded using `slice(1)`.
    //  Then, each remaining string element is converted to a number using `map(Number)`.
    const   tail   =   input . slice (   1   ) . map (   Number   )   ;


    //  Determine the maximum value present in the `tail` array.
    //  The spread operator (`...`) is used to pass array elements as individual arguments to `Math.max`.
    const   max   =   Math . max (   ...   tail   )   ;


    //  Perform a reduction operation on the `tail` array to calculate the final sum.
    //  The `reduce` method iterates over the array, accumulating a single result.
    console . log (   tail . reduce (   (   acc   ,   x   )   =>    {
        //  The accumulator (`acc`) is an object with two properties:
        //  `sum`: the running total.
        //  `flag`: a boolean indicating whether the maximum value (`max`) has already been encountered.

        //  Check if this is the first time we encounter the maximum value (`max`).
        if   (   !   acc . flag   &&   x   ===   max   )    {
            //  If it's the first encounter of `max`, add half of its value to the sum.
            //  Set `flag` to `true` to indicate that `max` has now been encountered.
            return   {   sum   :   acc . sum   +   x   /   2   ,   flag   :   true   }   ;
        }   else    {
            //  If `x` is not `max`, or if `max` has already been encountered,
            //  add the full value of `x` to the sum.
            //  The `flag` state remains unchanged.
            return   {   flag   :   acc . flag   ,   sum   :   acc . sum   +   x   }   ;
        }
    }   ,   //  Initial value for the accumulator:
              //  `flag` is `false` (max not yet encountered), `sum` is `0`.
    {   flag   :   false   ,   sum   :   0   }   ) . sum   )   ;   //  Finally, access the `sum` property of the reduced object.
}   ;


//  Execution of the script starts here.
//  Read content from standard input (`/dev/stdin`).
//  `readFileSync` reads the entire file synchronously.
//  `'utf8'` specifies the character encoding.
//  `.trim()` removes leading/trailing whitespace (including newlines).
//  `.split('\n')` divides the string into an array of lines.
//  This array of lines is then passed as an argument to the `main` function.
main (   fs . readFileSync (   '/dev/stdin'   ,   'utf8'   ) . trim (   ) . split (   '\n'   )   )   ;