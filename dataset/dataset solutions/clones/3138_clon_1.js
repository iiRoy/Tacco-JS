/*
 * This JavaScript program processes input data to count specific entries.
 * It's a demonstration of Type I code cloning principles.
 */
const   main    =   (   input   )   =>
{
    // The input string is first split by newline characters.
    input   =   input.split (   '\n'    )   ;


    // 'c' and 'B' are arrays derived from the first two lines of the input.
    const   c   =   input   [   0   ]   .split  (   ' ' )   ;

    const   B   =   input   [   1   ]   .split  (   ' ' )   ;


    // The main data array is then sliced to remove the first two lines.
    input   =   input   .slice  (   2   )   ;

    // Finally, we log the count of filtered elements.
    console .   log (   input   .filter (
        // For each value 'v' in the filtered input...
        v   =>  v   .split  (   ' ' )   .reduce (
            // The reduction calculates a weighted sum.
            (   pre ,   cur ,   i   )   =>  pre +   cur *   B   [   i   ]   ,   0
        )   >   0
    )   .length )   ;
}   ;   // End of main function definition.

// Execute the main function with data read from standard input.
main    (   require (   'fs'    )   .readFileSync   (   '/dev/stdin'    ,   'utf8'  )   )   ;