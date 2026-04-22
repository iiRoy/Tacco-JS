/*
* This is a Type I clone.
* It strictly adheres to the definition:
*   - All identifiers, operators, and expressions are identical.
*   - Only whitespace (spaces, tabs, newlines) and comments are altered.
* The goal is to make it look significantly different from the original,
* while being functionally identical down to the character level (excluding whitespace/comments).
*/
function     main   (
    input
)
{
    // Initialize input processing
    input     =     input.trim();


    // Deconstruct the parsed numeric array into three constants: a, b, and c.
    const   [     a,     b,     c     ]     =     input.split(" ")
                                                       .map(Number)
    ;


    // Begin conditional logic block.
    // The condition checks specific character relationships between 'a', 'b', and 'c'.
    if
    (
            a.slice(-1)     ==     b.slice(0,1)
        &&                                                     // Logical AND operator
            b.slice(-1)     ==     c.slice(0,1)
    )
    {

        // If the condition evaluates to true, print "YES" to the console.
        console.log("YES")
        ;
    }
    else
    {

        // If the condition evaluates to false, print "NO" to the console.
        console.log("NO")
        ;
    }


    // End of the main function scope.
}

// This part of the script is responsible for invoking the 'main' function.
// It reads data from standard input (typically a file or pipe) synchronously.
main
(
    require("fs")
        .readFileSync
        (
            "/dev/stdin",
            "utf8"
        )
)
; // Final semicolon for the main function call statement.

// Script execution finishes here.
// No further operations are performed after this point.