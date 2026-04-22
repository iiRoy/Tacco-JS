// This ensures strict mode for better error handling.
'use strict'


// Function to translate a number according to specific rules.
// It handles a special case for '1' and a general case otherwise.
const    translate    =    (    num    )    =>    {
    // If the number is exactly 1,
    // it's translated to 14.
    if    (    num    ==    1    )    return    num    =    14    ;
    // Otherwise, it returns the number itself (subtracting 0 has no effect).
    else    return    num    -    0    ;
}


// Main function to process input and determine the winner.
// @param {string} arg - The input string containing two numbers separated by a space.
function    main    (    arg    )    {
    // Split the input string into an array of two number strings.
    arg    =    arg    .    split    (    '    '    )    ;

    // Translate the first number.
    const    a    =    translate    (    arg    [    0    ]    )    ;
    // Translate the second number.
    const    b    =    translate    (    arg    [    1    ]    )    ;

    // Check for a draw condition.
    if    (    a    ==    b    )    return    console    .    log    (    'Draw'    )    ;

    // Determine the winner based on the translated numbers.
    if    (    a    >    b    )    {
        console    .    log    (    'Alice'    )    ;    // Alice wins
    }    else    {
        console    .    log    (    'Bob'    )    ;    // Bob wins
    }
}


// Read input from standard input and execute the main function.
// This is the entry point of the script.
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;