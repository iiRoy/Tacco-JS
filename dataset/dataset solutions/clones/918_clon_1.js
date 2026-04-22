/* This is a program to determine if a specific condition involving four numbers is met.
 * It reads input from standard input.
 */

// Import the 'fs' module for file system operations.
var                                                                                                   input
    =
    require('fs')
        .
        readFileSync(
            '/dev/stdin'
            ,
            'utf8'
        )
; // Finished reading input data.


/*
 * The input string is processed here.
 * It's trimmed, split by space, and then each part is converted to a number.
 * The four numbers are then destructured into variables a, b, c, and d.
 */
var                                               [
        a
        ,
        b
        ,
        c
        ,
        d
    ]
    =
    input
        .
        trim()
        .
        split(" ")
        .
        map(Number)
; // All variables initialized.


// Now, we evaluate the complex conditional expression.
if
(
    (
        a
        *
        b
    )
    %
    2
    !=
    0
    && // Logical AND operator
    (
        c
        +
        d
    )
    %
    2
    !=
    0
)
{
    // If the condition is true, output "No".
    console
        .
        log("No")
    ;
}
else // Otherwise, if the condition is false...
{
    // Output "Yes".
    console
        .
        log("Yes")
    ;
}
// End of program execution.