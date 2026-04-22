/*
 * This is a Type I clone of the original JavaScript program.
 * It demonstrates how whitespace and comments can be altered
 * without affecting the functional behavior of the code.
 * All identifiers, operators, and expressions are preserved exactly.
 */

function     Main    (    input    )
{
    // The Main function is responsible for processing the given input.

    input    =    input    .    split    (    "\n"    )    ; // First, the input string is divided into an array of lines.

    // A temporary variable 'tmp' is used to store the first line, split by spaces.
    tmp    =    input    [    0    ]    .    split    (    " "    )    ;

    var n    =    parseInt    (    tmp    [    0    ]    )    ; // The first element of 'tmp' is parsed as an integer 'n'.

    // An array 'a' of size 'n' is initialized, with all its elements set to 0.
    a    =    new    Array    (    n    )    .    fill    (    0    )    ;

    // 'min' is initialized to a very large number to ensure any input value will be smaller.
    var min    =    1000000000    ;

    // 'max' is initialized to zero, representing the maximum difference found so far.
    var max    =    0    ;

    // 'ans' (answer) keeps track of how many times the maximum difference has occurred.
    var ans    =    0    ;


    // A loop iterates 'n' times, processing each relevant input element.
    for    (    i    =    0    ;    i    <    n    ;    i    ++    )
    {
        // The i-th element from the second line of input is parsed and stored in a[i].
        a    [    i    ]    =    parseInt    (    input    [    1    ]    .    split    (    " "    )    [    i    ]    )    ;

        // This conditional block updates the minimum value encountered.
        if    (    min    >    a    [    i    ]    )
        {
            min    =    a    [    i    ]    ; // If a[i] is smaller than current 'min', 'min' is updated.
        }

        // This block evaluates and updates the maximum difference and its count.
        if    (    max    ==    a    [    i    ]    -    min    )
        {
            ans    ++    ; // If the current difference matches 'max', increment 'ans'.
        }
        else    if    (    max    <    a    [    i    ]    -    min    )
        {
            ans    =    1    ; // If a new maximum difference is found, reset 'ans' to 1.
            max    =    a    [    i    ]    -    min    ; // Update 'max' to this new larger difference.
        }
    }

    // Finally, the calculated answer 'ans' is logged to the console.
    console    .    log    (    '%s'    ,    ans    )    ;
}

// The Main function is called here, providing input read from standard input.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire file synchronously.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;