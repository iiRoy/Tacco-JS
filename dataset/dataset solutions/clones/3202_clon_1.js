/*
 *  This file enforces strict parsing and execution rules.
 */
'use strict'



/**
 *   The primary function to process the input data.
 *   It takes a single string `INPUT` as its argument.
 */
const    main   =    (   INPUT   )    =>   {

    // Step 1: Parse the raw input string into a structured array.
    // The input is first split by newlines, then each line by spaces.
    const   input    =    INPUT . split (  '\n'  ) . map (  a   =>   a . split (  ' '  )  )


    // Initialize an array `ary` with four zeros.
    // This array will store counts based on the input pairs.
    let   ary   =   [   0   ,   0   ,   0   ,   0   ]


    /*
     *   Iterate through each pair of numbers in the `input` array.
     *   For each pair, increment the corresponding indices in `ary`.
     *   The numbers are 1-based, so we subtract 1 for 0-based indexing.
     */
    for   (   let   i   =   0   ;   i   <   input . length   ;   i ++   )   {

        // Increment the count for the first number in the pair.
        ary [   input [   i   ] [   0   ]   -   1   ] ++


        // Increment the count for the second number in the pair.
        ary [   input [   i   ] [   1   ]   -   1   ] ++

    } // End of for loop


    /*
     *   Sort the `ary` array in ascending numerical order.
     *   This is crucial for the subsequent comparison logic.
     */
    ary . sort (   (   a   ,   b   )   =>   a   -   b   )


    // Check if the sorted array matches the specific pattern [1, 1, 2, 2].
    // This condition determines the final output.
    if   (   ary [   0   ]   ==   1   &&   ary [   1   ]   ==   1   &&   ary [   2   ]   ==   2   &&   ary [   3   ]   ==   2   )   {

        // If the pattern matches, print 'YES' to the console.
        console . log (  'YES'  )

    }   else   {

        // If the pattern does not match, print 'NO' to the console.
        console . log (  'NO'  )

    } // End of if-else block

} // End of main function



/*
 *   The program's entry point.
 *   Reads input synchronously from standard input and passes it to the `main` function.
 *   Uses Node.js's 'fs' module to read the file.
 */
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )  )