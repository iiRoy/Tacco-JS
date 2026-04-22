/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered or added extensively
 * to create a visually distinct but functionally identical version.
 */


const    main    =    stdin    =>    {
    // Define a constant 'input' variable to hold the processed standard input.
    const    input    =    stdin    .    trim()    .    split    (    '\n'    )

    // Original comments from the source code, preserved here.
    // ここにかく
    // 文字列S

    // Extract the first character from the first line of the input.
    const    N    =    input    [0]    .    split    (    " "    )    [0]    ;

    // Declare a mutable variable 'S' without an initial value.
    let    S    ;


    // Conditional assignment to 'S' based on the value of 'N'.
    if    (    N    ==    0    )
    {
        S    =    1    ;
    }    else
    {
        S    =    0    ;
    }    ; // Semicolon for the if/else statement block, as per original structure.

    // Output the final determined value of 'S' to the console.
    console    .    log    (    S    )    ;

}    ; // Semicolon terminating the 'main' function expression assignment.


// This section handles the execution entry point, reading from standard input.
// 標準入力 - Original comment, preserved.
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;