// This is a Type I clone of an original JavaScript program.
// The purpose of this file is to demonstrate code cloning.
// All functional aspects, variable names, and logic remain identical.

    'use strict' // Enforce strict mode for better error handling.


const    main   =  (   INPUT   )  =>    {
    // Function 'main' takes a single string 'INPUT' as its argument.

    const   tmp   =   INPUT .   split ( '\n' )
        .   map (   n   =>   Number (   n   )   )   ;   // Split input into lines and convert each to a number.

    tmp .   shift (   )   ;   // Remove the first element (often problem constraints, not data).

    let   input   =   tmp .   sort (   (   a   ,   b   )   =>   b   -   a   )   ;   // Sort numbers in descending order.

    let   ans   =   input [   0   ]   /   2   ;   // Initialize 'ans' with half of the largest number.

    // Loop through the remaining numbers and add them to 'ans'.
    for   (   let   i   =   1   ;   i   <   input .   length   ;   i   ++   )
    {
        ans   +=   input [   i   ]   ;   // Accumulate the sum.
    }


    console .   log (   ans   )   ;   // Output the final calculated answer.

}   ;   // End of the main function definition.


// Immediately invoke the main function with input read from standard input.
main (   require ( 'fs' ) .   readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;