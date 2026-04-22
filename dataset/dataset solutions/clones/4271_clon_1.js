/*
 * This file contains a JavaScript program.
 * It is a Type I clone, meaning its functionality and core structure
 * are identical to an original version.
 * Only whitespace, including indentation and line breaks,
 * and comments have been altered significantly.
 */


'use strict'   ; // Always good practice to enable strict mode.


const   main    =   (   input   )   =>  {
    // The main function processes the given input string.

    /*
     * First, the input is split into lines,
     * and each line is then split by spaces.
     * This creates a 2D array of strings.
     */
    const   args    =   input
                        .   split   (   '\n'    )
                        .   map     (   arg     =>      arg .   split   (   ' ' )   )   ;

    // Extract the first number from the first line of the input.
    const   R       =   parseInt    (   args[   0   ][   0   ],      10      )   ;

    // Extract the first number from the second line of the input.
    const   G       =   parseInt    (   args[   1   ][   0   ],      10      )   ;

    // Perform the calculation: (G multiplied by 2) minus R.
    // The result is then printed to the console.
    console .   log (   G   *   2   -   R   )   ;
}   ; // End of the 'main' function definition.


// This section handles the execution of the program.
// It reads data from standard input asynchronously and passes it to the 'main' function.
main    (
            require (   'fs'    )
                .   readFileSync    (   '/dev/stdin',       'utf8'  )
        )   ;

/*
 * End of the JavaScript program.
 * Thank you for reviewing this Type I clone example.
 */