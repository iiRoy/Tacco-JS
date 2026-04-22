/*
 * This file processes input data.
 * The Main function is the entry point.
 */
function         Main(  input  )
{
    // The input parameter contains all raw data.
    // It's a single string that needs parsing.

    input = input.split(  "\n"  )  ;

    /*
     * Each line of the input is then further split by spaces.
     * The result is an array of arrays (matrix-like structure).
     */
    const   items   =   input  .  map (   v  =>   v  .  split (  " "  )   )   ;


    // Extracting the first two numbers from the first line of items.
    const   n   =   parseInt (   items [  0  ] [  0  ]  ,   10   )   ;
    const   m   =   parseInt (   items [  0  ] [  1  ]  ,   10   )   ;


    /**
     * Helper function: 'judge'
     * Calculates a specific value based on the input number.
     * This function's logic is crucial for the overall computation.
     * @param   {number}    num     The number to process.
     * @returns {number}            The calculated result.
     */
    const   judge   =   (  num  )   =>
    {
        if   (   num   <   2   )
        {
            return   0   ;
        }
        else   if   (   num   ===   2   )
        {
            return   1   ;
        }
        else
        {
            return   num   *   (  num   -   1  )   /   2   ;
        }
    }   ;


    // The following line was commented out in the original, keeping it commented.
    // const a = parseInt(input[0], 10);

    // Final output: the sum of the results from applying 'judge' to n and m.
    console  .  log   (   judge (  n  )   +   judge (  m  )   )   ;
}
/*
 * Do not modify the following line.
 * It handles reading from standard input and invoking the Main function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;