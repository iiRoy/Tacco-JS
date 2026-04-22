/*
 *  This file contains a JavaScript program.
 *  It is a Type I clone, meaning only whitespace and comments
 *  have been modified from the original source.
 */

function    main    (    input    )    {

    // Declare a constant to hold the split input.
    const    H    =    input.split(' ');

    // Extract individual numerical components.
    const    A    =    H[0];

    const    B    =    H[1];


    // Perform three basic arithmetic operations.
    const    pls    =    A    +    B;
    const    min    =    A    -    B;
    const    kake    =    A    *    B;

    // Now, let's determine which of these results is the largest.
    if    (    pls    >    min    &&    pls    >    kake    )    {
        // If 'pls' is the maximum.
        console.log(pls);
    }    else    if    (    min    >    pls    &&    min    >    kake    )    {
        // If 'min' is the maximum.
        console.log(min);
    }    else    {
        // Otherwise, 'kake' must be the maximum.
        console.log(kake);
    }

} // End of main function.

// The program starts execution by calling 'main' with input from stdin.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// That's all folks!