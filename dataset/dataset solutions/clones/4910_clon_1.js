'use strict'
// This is a Type I clone of the original JavaScript code.
// The purpose is to demonstrate extensive changes in whitespace and comments
// while maintaining exact structural and logical identity.


const    main   =   arg   =>   {

    // Initialize the input processing.
    const   input   =   arg.trim().split("\n")   ;

    // Parse N and K from the first line of input.
    // N represents the total number of items, K is an initial value.
    let   N   =   input[0].split(' ')[0]   ;
    let   K   =   input[0].split(' ')[1]   ;

    // Initialize the result with the value of K.
    let   result   =   K   ;

    // Loop from 1 up to (but not including) N.
    // This loop calculates the product based on N and K.
    for   (   let   i   =   1   ;   i   <   N   ;   i++   )   {
        // Multiply the current result by (K - 1).
        result   =   result   *   (   K   -   1   )   ;
    }

    // Output the final calculated result to the console.
    console.log   (   result   )   ;

}

// This line calls the main function with input read from standard input.
// It uses Node.js's 'fs' module to read the file synchronously.
main(   require('fs').readFileSync('/dev/stdin',   'utf8')   )   ;