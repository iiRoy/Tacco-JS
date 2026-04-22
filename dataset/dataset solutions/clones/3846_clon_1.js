/*
 * This file contains a JavaScript program.
 * It's a Type I clone, meaning its functionality is identical
 * to an original source, but its appearance has been
 * significantly altered through changes in whitespace and comments.
 * All identifiers, operators, and expressions remain precisely as they were.
 */
'use strict'; // Enforces strict parsing and error handling rules.

// This is the primary function that encapsulates the program's logic.
// It takes a single argument, 's', which typically represents input.
function    main (    s    )
{
    // The input string 's' is immediately redefined here.
    // This fixed string "1 1\n" is used for subsequent processing,
    // effectively ignoring any external input passed to 'main'.
    s    =    '1 1\n'    ;

    // --- Input Processing Step ---
    // 1.   `s.split('\n')`: Splits the string by newline, resulting in an array of lines.
    // 2.   `[0]`: Selects the first line from the array.
    // 3.   `.split(' ')`: Splits the selected line by spaces, yielding an array of string numbers.
    // 4.   `.map(x => Number(x))`: Converts each string number in the array to an actual numeric type.
    // The result is an array of numbers, e.g., `[1, 1]`.
    s    =    s    .    split    (    '\n'    )    [    0    ]    .    split    (    ' '    )    .    map    (    x    =>    Number    (    x    )    )    ;



    // --- Variable Declarations and Assignment ---
    // 'a' is assigned the first element of the processed array 's'.
    const    a    =    s    [    0    ]    ;

    // 'b' is assigned the second element of the processed array 's'.
    const    b    =    s    [    1    ]    ;


    // --- Conditional Logic for Answer Calculation ---
    // This uses a ternary operator:
    // If 'a' is less than or equal to 'b', 'ans' takes the value of 'a'.
    // Otherwise (if 'a' is greater than 'b'), 'ans' takes the value of 'a - 1'.
    let    ans    =    (    a    <=    b    )    ?    a    :    (    a    -    1    )    ;

    // --- Output Phase ---
    // The calculated result, stored in 'ans', is printed to the console.
    console    .    log    (    ans    )    ;
}


// --- Program Entry Point ---
// This line executes the 'main' function.
// It reads content from '/dev/stdin' (standard input stream, common in Unix-like systems),
// using Node.js's built-in 'fs' (file system) module.
// The content is read synchronously (`readFileSync`) and decoded as 'utf8'.
// This read content is then passed as the 's' argument to the 'main' function.
// As noted earlier, 'main' immediately overwrites 's', making this input
// effectively ignored for the specific logic of this function, but it maintains
// the typical structure for competitive programming submissions.
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;