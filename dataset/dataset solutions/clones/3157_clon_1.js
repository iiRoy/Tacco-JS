/*
 *  This file demonstrates a JavaScript program
 *  designed to process numerical input.
 *  It adheres to strict mode for better code quality.
 */
'use strict' ;  //  Enforce strict parsing and error handling in the script.


//  ----------------------------------------------------------------------------------------------------
//  The primary entry point function for the application.
//  It takes a single 'input' string parameter.
//  ----------------------------------------------------------------------------------------------------
function    main   (    input    )
{
    //  Step 1: Process the raw input string into an array of numbers.
    //  -   'split('')' breaks the string into individual characters.
    //  -   'map(v => ~~v)' converts each character (string) to an integer.
    //      The '~~' operator is a bitwise NOT applied twice, effectively truncating to an integer.
    //  -   'slice(0, -1)' removes the last element, typically a newline character from input.
    let    nums    =    input
        .split    (    ''    )
        .map      (    v    =>    ~~v    )
        .slice    (    0,    -1    )
    ;  //  Semicolon explicitly terminates the 'nums' variable declaration.

    //  Step 2: Determine the total count of numbers.
    let    n    =    nums.length
    ;  //  Semicolon for statement termination.

    //  Step 3: Calculate the sum of all numbers, referred to as 'blue'.
    let    blue    =    nums.reduce    (    (    a,    c    )    =>    a    +    c    )
    ;  //  Semicolon for statement termination.

    //  Step 4: Calculate the count of 'red' items, which is the total minus 'blue' items.
    let    red    =    n    -    blue
    ;  //  Semicolon for statement termination.


    //  Step 5: Output the final calculated value to the console.
    //  The calculation is: 2 * (the smaller count of 'red' or 'blue').
    console.log    (    Math.min    (    red,    blue    )    *    2    )
    ;  //  Semicolon for statement termination.
} //  End of the 'main' function definition.


//  ----------------------------------------------------------------------------------------------------
//  Program execution begins here.
//  The 'main' function is invoked with content read from standard input.
//  'require('fs')' imports the Node.js file system module.
//  '.readFileSync('/dev/stdin', 'utf8')' reads the entire standard input synchronously as a UTF-8 string.
//  ----------------------------------------------------------------------------------------------------
main    (    require    (    'fs'    )    .readFileSync    (    '/dev/stdin',    'utf8'    )    )
;  //  Semicolon explicitly terminates the main function call statement.