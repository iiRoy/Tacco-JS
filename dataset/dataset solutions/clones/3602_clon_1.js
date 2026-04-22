// This is a Type I clone.
// It showcases significant variations in whitespace and comments
// while strictly maintaining all identifiers, operators, and expressions
// exactly as they appear in the original source code.

'use strict' // Strict mode enabled for the script.

const   main    =   (   input   )   =>
{
    // The main function processes the raw input string.
    // It first splits the string by spaces,
    // then converts each resulting substring into an integer.
    input   =   input   .   split   (   ' ' )
                        .   map     (   i   =>  parseInt    (   i   )   )

    // Assign the first parsed integer to constant A.
    const   A   =   input   [   0   ]

    // Assign the second parsed integer to constant B.
    const   B   =   input   [   1   ]

    // Calculate the final result: (A - 1) multiplied by (B - 1).
    // This calculated value is then printed to the console.
    console .   log (   (   A   -   1   )   *   (   B   -   1   )   )
} // End of the main function definition.


// The script execution starts here.
// It reads the input from '/dev/stdin' using Node.js 'fs' module,
// decodes it as UTF-8, and passes it to the 'main' function.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,
                                                        'utf-8'         )
)

// End of script.